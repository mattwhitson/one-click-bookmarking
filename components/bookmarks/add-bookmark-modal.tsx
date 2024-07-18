"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { client } from "@/lib/hono";
import { newBookmarkSchema } from "@/lib/zod-schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AddBookmarkModal() {
  const { type, isOpen, onClose } = useModalStore();
  const queryClient = useQueryClient();
  const isModalOpen = isOpen && type === ModalTypes.AddBookmark;

  const form = useForm<z.infer<typeof newBookmarkSchema>>({
    resolver: zodResolver(newBookmarkSchema),
    defaultValues: {
      url: "",
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof newBookmarkSchema>) => {
      const res = await client.api.bookmarks.$post({ json: { ...values } });
      if (res.ok) {
        const { message } = await res.json();
        toast(message);
      } else {
        const error = await res.json();
        console.log(error);
        toast("Something went wrong.");
      }
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const onSubmit = async (values: z.infer<typeof newBookmarkSchema>) => {
    mutate(values);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Add a bookmark
          </DialogTitle>
          <DialogDescription className="hidden">
            Add a new bookmark modal
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-col"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel textErrorColor="text-destructive dark:text-red-500">
                    Bookmark url
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://oneclickbookmark.ing"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="dark:text-red-500" />
                </FormItem>
              )}
            />
            <Button className="mx-auto" type="submit">
              Add bookmark
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
