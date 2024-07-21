"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

export function DeleteAccountModal() {
  const { data: session } = useSession();
  const { type, isOpen, onClose } = useModalStore();
  const router = useRouter();

  const isModalOpen = isOpen && type === ModalTypes.DeleteAccount;

  async function handleClick() {
    if (!session || !session.user || !session.user.id) return;
    try {
      await client.api.user[":userId"].$delete({
        param: { userId: session?.user?.id },
      });
      toast("Account successfully deleted! Sorry to see you go :(");
      onClose();
      router.push("/");
    } catch (error) {
      console.log(error);
      toast("Something went wrong...");
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Delete your account
          </DialogTitle>
          <DialogDescription className="text-center">
            Delete your profile and all bookmarks and tags associated with it.
            This action is irreversible
          </DialogDescription>
        </DialogHeader>
        <Button className="mx-auto w-1/2" onClick={() => onClose()}>
          Take me back
        </Button>
        <Button
          variant="destructive"
          className="mx-auto w-1/2"
          onClick={handleClick}
        >
          Delete account
        </Button>
      </DialogContent>
    </Dialog>
  );
}
