"use client";

import { useSearchParams } from "next/navigation";
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
import { Tag } from "@/app/api/[[...route]]/bookmarks";
import { useEffect, useState } from "react";
import { InfiniteQueryBookmarks } from ".";
import { useSession } from "next-auth/react";
import { useGetTags } from "@/hooks/use-get-tags";
import { Loader2 } from "lucide-react";
import { autoInvalidatedPaths } from "@/lib/utils";

export function ChangeTagsModal() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || undefined;
  const filterParam = searchParams.get("filter") || undefined;
  const tagsArray = searchParams.getAll("tags");
  const tagsParam = tagsArray.length ? tagsArray : undefined;

  const { type, isOpen, onClose, data } = useModalStore();
  const isModalOpen = isOpen && type === ModalTypes.ChangeTag;

  const tags = useGetTags(data?.userId);
  const [selectedTags, setSelectedTags] = useState<boolean[]>([]);

  useEffect(() => {
    if (tags.data === undefined) return;

    const result = tags.data?.map((tag) => {
      for (let i = 0; i < data?.bookmark?.tags.length; i++) {
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
      const { error } = await res.json();
      toast(error);
      throw error; // why am i throwing here?
    },
    onSuccess(result, variables) {
      queryClient.setQueryData(
        ["userBookmarks", filterParam, searchParam, tagsParam],
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

      autoInvalidatedPaths.forEach((path) => {
        if (path !== filterParam) {
          queryClient.invalidateQueries({
            queryKey: ["userBookmarks", path, undefined, undefined],
          });
        }
      });

      queryClient.setQueryData(["tags", data?.userId], (prev: Tag[]) => {
        return [...prev, { id: result?.id, tag: result?.tag }];
      });
      // TODO: should probably just fetch bookmaarks like i do for the tags
      // kind of hacky, should think of a better way of doing this (maybe should make a useQuery for each bookmark id? then i wouldn't need to pass in the data object from useModalState)
      data.bookmark.tags.push({ id: result?.id, tag: result?.tag });
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
          toast("Tags updated!");
          return result;
        }
        const error = await res.json();
        toast("Something went wrong...");
        throw error;
      },
      onSuccess(result, variables) {
        const added = result.added;
        const deleted = result.deleted;
        const bookmarkId = result.bookmarkId;

        console.log(searchParam, tagsParam);
        if (!searchParam && !tagsParam) {
          queryClient.setQueryData(
            ["userBookmarks", filterParam, searchParam, tagsParam],
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
        } else {
          queryClient
            .getQueryCache()
            .getAll()
            .map((cache) =>
              console.log(JSON.parse(JSON.stringify(cache.queryKey)))
            );
          console.log(tagsParam);
          queryClient.invalidateQueries({
            queryKey: ["userBookmarks", filterParam, searchParam, tagsParam],
          });
          queryClient
            .getQueryCache()
            .getAll()
            .map((cache) =>
              console.log(JSON.parse(JSON.stringify(cache.queryKey)))
            );
        }

        autoInvalidatedPaths.forEach((path) => {
          if (path !== filterParam) {
            queryClient.invalidateQueries({
              queryKey: ["userBookmarks", path, undefined, undefined],
            });
          }
        });

        data.bookmark.tags = [
          ...data.bookmark.tags.filter((tag) => !deleted?.includes(tag.id)),
          ...added,
        ];
      },
    });

  const onNewTagSubmit = async (values: z.infer<typeof newTagSchema>) => {
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
              {tags.data ? (
                <>
                  {tags.data.map(({ id, tag }, index) => (
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
                </>
              ) : (
                <Loader2 className="animate-spin mx-auto w-12 h-12" />
              )}
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
            onSubmit={form.handleSubmit(onNewTagSubmit)}
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
