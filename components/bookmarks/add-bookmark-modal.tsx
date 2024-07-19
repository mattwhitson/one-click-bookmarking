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
import { InfiniteQueryBookmarks } from ".";
import { Tag } from "@/app/api/[[...route]]/bookmarks";

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
        const bookmark = await res.json();
        toast("Successfully created bookmark!");
        return bookmark;
      } else {
        const error = await res.json();
        console.log(error);
        toast("Something went wrong.");
      }
    },

    // TODO: should i just requery the result or do this? idk, probably should test it later
    onSuccess(data) {
      if (data !== undefined) {
        const bookmark = { ...data.bookmark, tags: [] as Tag[] };
        const metadata = { ...data.metadata };
        queryClient.setQueryData(
          ["userBookmarks"],
          (prev: InfiniteQueryBookmarks) => {
            console.log("WTF");
            const copy: InfiniteQueryBookmarks = JSON.parse(
              // cloning was being a mofo so I decided to go with the simpler approach!!! *(probably should change later)
              JSON.stringify(prev)
            );
            copy.pages[0].bookmarks.unshift(bookmark);
            copy.pages[0].metadata.unshift(metadata);
            const result = copy;
            return result;
          }
        );
      }
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
