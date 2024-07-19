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
import { useEffect, useState } from "react";

export function AddTagModal() {
  const { type, isOpen, onClose, data } = useModalStore();
  const isModalOpen = isOpen && type === ModalTypes.AddTag;

  const [selectedTags, setSelectedTags] = useState<boolean[]>([]);

  useEffect(() => {
    const result = data.tags?.map((tag) => {
      for (let i = 0; i < data.bookmark?.tags.length; i++) {
        if (data.bookmark?.tags[i].id === tag.id) return true;
      }
      return false;
    });
    setSelectedTags(result);
  }, [isModalOpen, data?.bookmark?.tags, data?.tags]);

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
      if (res.ok) {
        const { tag } = await res.json();
        toast("Tag successfully created");
        return tag;
      }
      const error = await res.json();
      toast(error.error);
      throw error; // why am i throwing here?
    },
    onSuccess(result, variables) {
      queryClient.setQueryData(["userBookmarks"], (prev: Bookmark[]) =>
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
      setSelectedTags((prev) => [...prev, true]);
    },
  });

  const onSubmit = async (values: z.infer<typeof newTagSchema>) => {
    mutate({ tag: values.tag, bookmarkId: data.bookmark.id });
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
            <CommandGroup heading="Your tags" className="-z-50">
              {data.tags.map(({ id, tag }, index) => (
                <CommandItem
                  selected={selectedTags && selectedTags[index]}
                  key={id}
                  className="my-1"
                  onSelect={() => {
                    console.log("Here");
                    setSelectedTags((state) =>
                      state?.map((tag, i) => (i !== index ? tag : !tag))
                    );
                  }}
                >
                  {tag}
                </CommandItem>
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
