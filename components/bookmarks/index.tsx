"use client";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Bookmark, Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { Fragment, useEffect, useRef } from "react";
import { InfiniteData } from "@tanstack/react-query";

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetBookmarks();

  console.log(session);
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
  console.log(allTags);
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
