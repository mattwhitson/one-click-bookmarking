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
import { useRouter } from "next/navigation";

interface Props {
  userId: string | undefined;
}

export function FilterDropdown({ userId }: Props) {
  const router = useRouter();
  const [tagsSelected, setTagsSelected] = useState<boolean[]>([]);
  const tags = useGetTags(userId);

  useEffect(() => {
    setTagsSelected(Array(tags.data?.length).fill(false));
  }, [tags.data?.length]);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="p-2 h-fit mr-2" variant="ghost">
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() => {}} // get rid of this, we can use useQuery hook
        >
          <span>Date (Ascending)</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:cursor-pointer">
          <span>Date (Descending)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push(
              "/filter" + "?" + createQueryString("favorites", "true")
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
                      className="hover:cursor-pointer"
                      onClickCapture={(e) => e.preventDefault()}
                      onClick={() =>
                        setTagsSelected((state) =>
                          state?.map((tag, i) => (i !== index ? tag : !tag))
                        )
                      }
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
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
