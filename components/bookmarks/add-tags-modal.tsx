"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ModalTypes, useModalStore } from "@/hooks/modal-store";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { newTagSchema } from "@/lib/zod-schemas";
import { Button } from "../ui/button";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "./card";
import { Tag } from "@/app/api/[[...route]]/bookmarks";

export function AddTagModal() {
  const { type, isOpen, onClose, data } = useModalStore();
  const isModalOpen = isOpen && type === ModalTypes.AddTag;

  const form = useForm<z.infer<typeof newTagSchema>>({
    resolver: zodResolver(newTagSchema),
    defaultValues: {
      tag: "",
    },
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { tag: string; bookmarkId: number }) => {
      const res = await client.api.tags.$post({
        json: { tag: values.tag, bookmarkId: values.bookmarkId },
      });
      console.log(res);
      if (res.ok) {
        const { tag } = await res.json();
        toast("Tag successfully created");
        return tag;
      }
      const error = await res.json();
      toast(error.error);
      throw error;
    },
    onSuccess(result, variables) {
      queryClient.setQueryData(["bookmarks"], (prev: Bookmark[]) =>
        prev?.map((post) =>
          post.id === variables.bookmarkId
            ? {
                ...post,
                tags: [...post.tags, { id: result.id, tag: result.tag }],
              }
            : post
        )
      );
      queryClient.setQueryData(["tags"], (prev: Tag[]) => {
        prev.push({ id: result?.id, tag: result?.tag });
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof newTagSchema>) => {
    mutate({ tag: values.tag, bookmarkId: data.id });
    onClose();
  };

  if (!isModalOpen) return null;
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Add new tags
          </DialogTitle>
          <DialogDescription className="text-center">
            Add new tags to your modal to better organize your bookmarks!
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search your tags..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Your tags">
              {data.tags.map(({ id, tag }) => (
                <CommandItem key={id}>{tag}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel textErrorColor="text-destructive dark:text-red-500">
                    Or create a new tag here
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Example tag..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="dark:text-red-500" />
                </FormItem>
              )}
            />
            <Button className="mx-auto w-1/2" type="submit">
              Save tag
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
