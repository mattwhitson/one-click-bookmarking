"use client";

import { Plus } from "lucide-react";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { Button } from "@/components/ui/button";

export function AddBookmarkButton() {
  const { onOpen } = useModalStore();

  return (
    <Button
      variant="ghost"
      className="h-12 w-12 p-0"
      onClick={() => onOpen(ModalTypes.AddBookmark)}
    >
      <Plus className="w-8 h-8" />
    </Button>
  );
}
