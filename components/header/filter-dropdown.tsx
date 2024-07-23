"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useGetTags } from "@/hooks/use-get-tags";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";

interface Props {
  userId: string | undefined;
}

export function FilterDropdown({ userId }: Props) {
  const { isOpen, type, onClose, onOpen } = useModalStore();
  const [tagsSelected, setTagsSelected] = useState<boolean[]>([]);
  const router = useRouter();
  const tags = useGetTags(userId);

  const isDropdownOpen = isOpen && type === ModalTypes.DropdownMenu;

  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const tagsFitlerParam = searchParams.get("tags");

  useEffect(() => {
    setTagsSelected(Array(tags.data?.length).fill(false));
  }, [tags.data?.length]);

  useEffect(() => {
    if (!tagsFitlerParam) {
      setTagsSelected(Array(tags.data?.length).fill(false));
    }
  }, [tagsFitlerParam, tags.data?.length]);

  function handleClick() {
    let newUrl = "bookmarks?";
    let first = true;
    if (!tags.data) return;

    for (let i = 0; i < tagsSelected.length; i++) {
      if (tagsSelected[i]) {
        newUrl += `${!first ? "&" : ""}tags=${tags.data[i].tag}`;
        first = false;
      }
    }

    if (first === true) {
      router.push("/bookmarks");
      onClose();
    }
    router.push(newUrl);
    onClose();
  }

  return (
    <DropdownMenu modal={false} open={isDropdownOpen} onOpenChange={onClose}>
      <DropdownMenuTrigger asChild>
        <Button
          className="p-2 h-fit mr-2"
          variant="ghost"
          onClick={() => onOpen(ModalTypes.DropdownMenu)}
        >
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() => {
            router.push(
              `/bookmarks${searchParam ? `?search=${searchParam}` : ""}`
            );
          }}
        >
          <span>Date (Descending)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() =>
            router.push(
              `/bookmarks?filter=ascending${
                searchParam ? `&search=${searchParam}` : ""
              }`
            )
          }
        >
          <span>Date (Ascending)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push(
              `/bookmarks?filter=favorites${
                searchParam ? `&search=${searchParam}` : ""
              }`
            );
          }}
          className="hover:cursor-pointer"
        >
          <span>Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Tags</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-h-96 overflow-y-scroll">
              {tags.data ? (
                <>
                  {tags.data.map((tag, index) => (
                    <DropdownMenuItem
                      key={tag.id}
                      className="hover:cursor-pointer hover:blue-500 sm:hover-bg-[hsl(var(--secondary))]"
                      onClickCapture={(e) => {
                        e.preventDefault();
                        setTagsSelected((state) =>
                          state?.map((tag, i) => (i !== index ? tag : !tag))
                        );
                        e.currentTarget.blur();
                      }}
                      style={{
                        backgroundColor: tagsSelected[index]
                          ? "hsl(var(--secondary))"
                          : "",
                      }}
                    >
                      <span>{tag.tag}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              ) : (
                <Loader2 className="animate-spin mx-auto w-4 h-4" />
              )}
              <Button
                className="mt-2 h-8"
                variant="secondary"
                onClick={handleClick}
              >
                Apply tags
              </Button>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
