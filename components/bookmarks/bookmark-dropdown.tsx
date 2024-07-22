"use client";

import { useSearchParams } from "next/navigation";
import { FiMoreHorizontal } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { Tag } from "@/app/api/[[...route]]/bookmarks";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@/components/bookmarks/card";
import { InfiniteQueryBookmarks } from "@/components/bookmarks/index";

interface Props {
  bookmark: Bookmark;
  tags: Tag[];
}

export function BookmarkDropdown({ bookmark, tags }: Props) {
  const { onOpen } = useModalStore();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || undefined;
  const filterParam = searchParams.get("filter") || undefined;

  const { mutate: deleteMutation, isPending: deleteIsPending } = useMutation({
    mutationFn: async (bookmarkId: number) => {
      const res = await client.api.bookmarks[":bookmarkId"].$delete({
        param: { bookmarkId: String(bookmarkId) },
      });
      if (res.ok) {
        toast("Bookmark successfully deleted");
      } else {
        const error = await res.json();
        console.log(error);
        toast("Something went wrong.");
      }
    },
    onSuccess(res, bookmarkId) {
      queryClient.setQueryData(
        ["userBookmarks", filterParam, searchParam],
        (prev: InfiniteQueryBookmarks) => {
          const result = prev?.pages.map((page) => ({
            ...page,
            bookmarks: page.bookmarks.filter((post) => post.id !== bookmarkId),
          }));
          return { ...prev, pages: result };
        }
      );
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="p-1 h-fit" variant="ghost">
          <FiMoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onOpen(ModalTypes.ChangeTag, { bookmark: bookmark })} // get rid of this, we can use useQuery hook
        >
          Edit tags
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => deleteMutation(bookmark.id)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
