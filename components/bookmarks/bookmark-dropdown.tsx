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

interface Props {
  bookmarkId: number;
}

export function BookmarkDropdown({ bookmarkId }: Props) {
  const { onOpen } = useModalStore();
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
          onClick={() => onOpen(ModalTypes.AddTag, { id: bookmarkId })}
        >
          Add tag
        </DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
