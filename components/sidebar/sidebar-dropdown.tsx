"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";

interface Props {
  dropdownTrigger: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SidebarDropdown({
  dropdownTrigger,
  children,
  className = "",
}: Props) {
  const { onOpen } = useModalStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {dropdownTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onOpen(ModalTypes.DeleteAccount);
          }}
        >
          <Button variant="destructive">Delete Account</Button>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>{children}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
