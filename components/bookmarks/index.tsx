"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Bookmark, Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { Fragment, useEffect, useRef } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

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
  searchTerm: string | string[] | undefined;
  filter: string | string[] | undefined;
  userId: string;
}

export function Bookmarks({ filter, searchTerm, userId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Invalidation");
    queryClient.invalidateQueries({
      queryKey: ["userBookmarks", filter, searchTerm],
    });
  }, [searchParams, queryClient, searchTerm, filter]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useGetBookmarks(filter, searchTerm);

  const allTags = useGetTags(userId);

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

  // should we add isFetching here? probably, even though it means theres a loading bar, because
  // stuff popping up randomly is arguably a crappier experience than waiting the couple seconds for
  // the data to load.
  if ((data === undefined && status !== "success") || status === "pending") {
    return <Loader2 className="animate-spin mx-auto mt-16 w-12 h-12" />;
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
