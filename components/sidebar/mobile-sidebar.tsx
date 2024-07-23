"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { SearchBar } from "@/components/header/search-bar";
import { DownloadCsv } from "./download-csv";

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { onOpen, isOpen, onClose, type } = useModalStore();
  const pathname = usePathname();

  const isModalOpen = isOpen && type === ModalTypes.MobileSidebar;

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640) {
        onClose();
      }
    }
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);
  return (
    <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="fixed flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center">
            <Image
              src="/Bookmark-dynamic-gradient.png"
              alt="Logo"
              width={48}
              height={48}
              priority
              className="mx-auto min-w-12 min-h-12 max-h-12 max-w-12"
            />
            One Click Bookmarking
          </SheetTitle>
          <SheetDescription className="hidden">
            Mobile navigation and search
          </SheetDescription>
        </SheetHeader>
        <div className="sm:w-full">
          <SearchBar session={session} width="sm:w-full" />
        </div>
        <section className="flex flex-col items-center mt-4 space-y-6">
          <Link
            onClick={() => onClose()}
            className="text-2xl text-zinc-600 font-semibold hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            href="/bookmarks"
          >
            Home
          </Link>
          <Link
            onClick={() => onClose()}
            className="text-2xl text-zinc-600 font-semibold hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            href="/tags"
          >
            Tags
          </Link>
          <DownloadCsv />
        </section>
        {children}
      </SheetContent>
    </Sheet>
  );
}
