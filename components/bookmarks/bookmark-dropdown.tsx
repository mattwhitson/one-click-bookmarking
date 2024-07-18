"use client";

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
import { useState } from "react";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { Tag } from "@/app/api/[[...route]]/bookmarks";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "./card";

interface Props {
  bookmarkId: number;
  tags: Tag[];
}

export function BookmarkDropdown({ bookmarkId, tags }: Props) {
  const { onOpen } = useModalStore();
  const queryClient = useQueryClient();
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
      queryClient.setQueryData(["bookmarks"], (prev: Bookmark[]) =>
        prev?.filter((post) => post.id !== bookmarkId)
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
          onClick={() =>
            onOpen(ModalTypes.AddTag, { id: bookmarkId, tags: tags })
          }
        >
          Add tag
        </DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuItem onClick={() => deleteMutation(bookmarkId)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
