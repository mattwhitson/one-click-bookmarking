"use client";

import { File, HomeIcon, Plus, Search, Star } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";

export function Sidebar() {
  const { onOpen } = useModalStore();
  return (
    <nav className="hidden sm:flex flex-col rounded-sm min-w-20 items-center gap-y-6 pb-6 py-1">
      <Button variant="ghost" className="h-12 w-12 p-0">
        <HomeIcon className="w-8 h-8" />
      </Button>
      <Button
        variant="ghost"
        className="h-12 w-12 p-0"
        onClick={() => onOpen(ModalTypes.AddBookmark)}
      >
        <Plus className="w-8 h-8" />
      </Button>
      <Button variant="ghost" className="h-12 w-12 p-0">
        <Search className="w-8 h-8" />
      </Button>
      <Button asChild variant="ghost" className="h-12 w-12 p-0">
        <Link href="/favorites">
          <Star className="w-8 h-8" />
        </Link>
      </Button>
      <Button asChild variant="ghost" className="h-12 w-12 p-0">
        <Link href="/export">
          <File className="w-8 h-8" />
        </Link>
      </Button>
    </nav>
  );
}
