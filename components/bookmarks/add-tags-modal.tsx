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
import { InfiniteQueryBookmarks } from ".";
import { auth } from "@/auth";
import { useSession } from "next-auth/react";
import { useGetTags } from "@/hooks/use-get-tags";
import { pages } from "next/dist/build/templates/app-page";

export function AddTagModal() {
  const { data: session } = useSession();

  const tags = useGetTags(session?.user?.id);

  const { type, isOpen, onClose, data } = useModalStore();
  const isModalOpen = isOpen && type === ModalTypes.AddTag;

  const [selectedTags, setSelectedTags] = useState<boolean[]>([]);

  useEffect(() => {
    if (tags.data === undefined) return;

    const result = tags.data?.map((tag) => {
      for (let i = 0; i < data.bookmark?.tags.length; i++) {
        if (data.bookmark?.tags[i].id === tag.id) return true;
      }
      return false;
    });
    setSelectedTags(result);
  }, [isModalOpen, data?.bookmark?.tags, tags.data]);

  const form = useForm<z.infer<typeof newTagSchema>>({
    resolver: zodResolver(newTagSchema),
    defaultValues: {
      tag: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate: addTag, isPending: addTagPending } = useMutation({
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
      queryClient.setQueryData(
        ["userBookmarks"],
        (prev: InfiniteQueryBookmarks) => ({
          ...prev,
          pages: prev?.pages.map((page) => ({
            ...page,
            bookmarks: page.bookmarks.map((bookmark) =>
              bookmark.id === variables.bookmarkId
                ? {
                    ...bookmark,
                    tags: [
                      ...bookmark.tags,
                      { id: result.id, tag: result.tag },
                    ],
                  }
                : { ...bookmark }
            ),
          })),
        })
      );
      queryClient.setQueryData(["tags", session?.user?.id], (prev: Tag[]) => {
        return [...prev, { id: result?.id, tag: result?.tag }];
      });
      setSelectedTags((prev) => [...prev, true]);
    },
  });

  const { mutate: updateBookmarkTags, isPending: updateBookmarkTagsPending } =
    useMutation({
      mutationFn: async ({
        toBeAdded,
        toBeRemoved,
      }: {
        toBeAdded: Tag[];
        toBeRemoved: Tag[];
      }) => {
        const res = await client.api.tags[":bookmarkId"].$patch({
          param: { bookmarkId: String(data.bookmark.id) },
          json: { toBeRemoved, toBeAdded },
        });

        if (res.ok) {
          const result = await res.json();
          return result;
        }
        const error = await res.json();
        throw error;
      },
      onSuccess(data, variables) {
        const added = data.added;
        const deleted = data.deleted;
        const bookmarkId = data.bookmarkId;
        queryClient.setQueryData(
          ["userBookmarks"],
          (prev: InfiniteQueryBookmarks) => ({
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              bookmarks: page.bookmarks.map((bookmark) =>
                bookmark.id === bookmarkId
                  ? {
                      ...bookmark,
                      tags: [
                        ...bookmark.tags.filter(
                          (tag) => !deleted?.includes(tag.id)
                        ),
                        ...added,
                      ],
                    }
                  : { ...bookmark }
              ),
            })),
          })
        );
      },
    });

  const onSubmit = async (values: z.infer<typeof newTagSchema>) => {
    addTag({ tag: values.tag, bookmarkId: data.bookmark.id });
  };

  const handleTagsUpdate = async () => {
    const toBeRemoved =
      tags.data?.filter((tag, index) => {
        for (let i = 0; i < data.bookmark?.tags.length; i++) {
          if (data.bookmark?.tags[i].id === tag.id && !selectedTags[index])
            return true;
        }
        return false;
      }) || [];
    const toBeAdded =
      tags.data?.filter((tag, index) => {
        for (let i = 0; i < data.bookmark?.tags.length; i++) {
          if (data.bookmark?.tags[i].id === tag.id) return false;
        }
        if (selectedTags[index]) return true;
        return false;
      }) || [];

    updateBookmarkTags({ toBeAdded, toBeRemoved });
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
              {tags.data?.map(({ id, tag }, index) => (
                <CommandItem
                  selected={selectedTags && selectedTags[index]}
                  key={id}
                  className="my-1"
                  onSelect={() => {
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
        <Button
          className="mx-auto w-1/2 my-1"
          onClick={handleTagsUpdate}
          disabled={updateBookmarkTagsPending}
        >
          Update tags for this post
        </Button>
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
            <Button
              className="mx-auto w-1/2"
              type="submit"
              disabled={addTagPending}
            >
              Save tag
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
