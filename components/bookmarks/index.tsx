"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Bookmark, Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { Fragment, useEffect, useRef } from "react";
import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

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

export function Bookmarks() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();

  const path = usePathname();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetBookmarks(path);

  const allTags = useGetTags(session?.user?.id);

  useEffect(() => {
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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
