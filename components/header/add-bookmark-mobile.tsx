"use client";

import { Button } from "@/components/ui/button";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";

export function AddBookmarkMobile() {
  const { onOpen } = useModalStore();
  return (
    <Button
      className="p-2 h-fit mr-2 sm:hidden"
      variant="ghost"
      onClick={() => onOpen(ModalTypes.AddBookmark)}
    >
      New Bookmark
    </Button>
  );
}
