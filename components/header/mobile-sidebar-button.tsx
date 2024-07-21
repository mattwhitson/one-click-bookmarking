"use client";

import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";

export function MobileSidebarButton({ session }: { session: Session | null }) {
  const { onOpen } = useModalStore();
  return (
    <>
      {session && (
        <Button
          variant="ghost"
          className="sm:hidden h-12 w-12 p-0 mr-auto"
          onClick={() => onOpen(ModalTypes.MobileSidebar)}
        >
          <MenuIcon className="h-8 w-8" />
        </Button>
      )}
    </>
  );
}
