"use client";
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

interface Props {
  favorites: boolean;
}

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
    metadata: {
      title: string;
      image: string;
      description: string;
      bookmarkId: number;
    }[];
  },
  unknown
>;

export function Bookmarks({ favorites }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetBookmarks();

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

  if (data === undefined && status !== "success") {
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
              metadata={page.metadata[j]}
              // TODO: figure out how to whether post is in same day or not so we only display the date when the bookmark
              //       is from an earlier day
            />
          ))}
        </Fragment>
      ))}
      {isFetchingNextPage ? (
        <Loader2 className="animate-spin mx-auto w-12 h-12" />
      ) : (
        <div ref={ref} />
      )}
    </>
  );
}
