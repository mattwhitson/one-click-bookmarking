"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Bookmark, Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { autoInvalidatedPaths } from "@/lib/utils";
import { useLoading } from "@/hooks/use-loading";
import { useIsFirstLoad } from "@/hooks/use-is-first-load";

export type InfiniteQueryBookmarks = InfiniteData<
  {
    bookmarks: {
      id: number;
      url: string;
      favorite: boolean;
      createdAt: string | null;
      tags: {
        id: number;
        tag: string;
      }[];
    }[];
    cursor: number | undefined;
  },
  unknown
>;

interface Props {
  filter: string | string[] | undefined;
  searchTerm: string | string[] | undefined;
  tagsFilter: string | string[] | undefined;
  userId: string;
}

function isDefaultRevalidatedPath(
  filter: string | string[] | undefined,
  searchTerm: string | string[] | undefined,
  tagsFilter: string | string[] | undefined
) {
  if (Array.isArray(filter) || tagsFilter || searchTerm) return false;
  return autoInvalidatedPaths.includes(filter);
}

export function Bookmarks({ filter, searchTerm, tagsFilter, userId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      !searchTerm &&
      !tagsFilter &&
      isDefaultRevalidatedPath(filter, searchTerm, tagsFilter)
    ) {
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["userBookmarks", filter, searchTerm, tagsFilter],
    });
  }, [searchParams, queryClient, searchTerm, filter, tagsFilter]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useGetBookmarks(
    filter,
    searchTerm,
    tagsFilter !== undefined && !Array.isArray(tagsFilter)
      ? [tagsFilter]
      : tagsFilter
  );

  useEffect(() => {
    // In the event the user deletes a bunch of bookmarks at the top of the page
    if (
      ref === null ||
      ref.current === null ||
      isFetchingNextPage ||
      !hasNextPage
    )
      return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top <= window.innerHeight) {
      fetchNextPage();
    }

    function handleScroll() {
      if (
        ref === null ||
        ref.current === null ||
        isFetchingNextPage ||
        !hasNextPage
      )
        return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight) {
        fetchNextPage();
      }
    }

    window.addEventListener("scroll", handleScroll, true);

    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, data]);

  const allTags = useGetTags(userId);

  // should i use the loading hook? It's kinda makes the experience more jank, so probably not
  const { isLoading } = useLoading(isFetching);
  const { isFirstLoad, haveParamsChanged } = useIsFirstLoad(isFetching);

  if (isFetching && !isFirstLoad && haveParamsChanged) {
    return <Loader2 className="animate-spin mx-auto w-12 h-12 mt-6" />;
  }

  return (
    <>
      {data?.pages.map((page, index) => (
        <Fragment key={index}>
          {page.bookmarks.map((bookmark: Bookmark, j) => (
            <Card
              key={bookmark.id}
              bookmark={bookmark}
              allTags={allTags.data}
              userId={userId}
            />
          ))}
        </Fragment>
      ))}
      {isFetchingNextPage ? (
        <Loader2 className="animate-spin mx-auto w-12 h-12 mt-6" />
      ) : (
        <div ref={ref} />
      )}
    </>
  );
}
