"use client";

import { useGetTags } from "@/hooks/use-get-tags";
import { Session } from "next-auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Button } from "../ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InfiniteQueryBookmarks } from "../bookmarks";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { Tag } from "@/app/api/[[...route]]/bookmarks";

export function Tags({ session }: { session: Session }) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: tags } = useGetTags(session?.user?.id);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (tagId: number) => {
      const res = await client.api.tags[":tagId"].$delete({
        param: { tagId: String(tagId) },
      });
      if (res.ok) {
        const bookmark = await res.json();
        toast("Successfully deleted tag!");
        return bookmark;
      } else {
        const error = await res.json();
        console.log(error);
        toast("Something went wrong.");
      }
    },

    // TODO: should i just requery the result or do this? idk, probably should test it later
    async onSuccess(data) {
      if (data !== undefined) {
        queryClient.invalidateQueries({
          queryKey: ["userBookmarks", "/bookmarks", undefined],
          refetchType: "active",
        });

        queryClient.invalidateQueries({
          queryKey: ["userBookmarks", "/favorites", undefined],
          refetchType: "active",
        });

        queryClient.setQueryData(["tags", session?.user?.id], (prev: Tag[]) => [
          ...prev.filter((tag) => tag.id !== data.tagId),
        ]);
      }
    },
  });

  function handleDelete(id: number) {
    mutate(id);
  }

  return (
    <div className="w-full p-6 mt-16 mx-auto max-w-xl">
      <h3 className="text-lg border-b-[1px] dark:border-zinc-900 text-right">
        Total tags used:{" "}
        <span className="font-semibold">{tags?.length || 0}/100</span>
      </h3>
      {tags &&
        tags?.map(({ tag, id }) => (
          <div
            key={id}
            className="mx-auto h-16 flex items-center border-b-[1px] dark:border-zinc-900 px-4"
          >
            {tag}
            <div className="ml-auto flex space-x-6">
              <Button
                variant="ghost"
                className="h-12 w-12 p-0"
                onClick={() => handleDelete(id)}
                disabled={isPending}
              >
                <FiTrash2 className="w-6 h-6" />
              </Button>
              {}
            </div>
          </div>
        ))}
    </div>
  );
}
