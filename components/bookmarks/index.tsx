"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Bookmark, Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { autoInvalidatedPaths } from "@/lib/utils";

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
  const pathname = usePathname();
  const [routeChanged, setRouteChanged] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      !searchTerm &&
      !tagsFilter &&
      isDefaultRevalidatedPath(filter, searchTerm, tagsFilter)
    ) {
      console.log("Guttentaig");
      return;
    }
    console.log("NEIN");
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
  } = useGetBookmarks(filter, searchTerm, tagsFilter);

  const allTags = useGetTags(userId);

  // these next two useEffects are used to check for route change so we can show loading symbol on param change(i.e. search or tag filter)
  // but not to show it when loading most often used ordering like favorites or asc/desc (because they are prefetched on the server and revalidated on every mutation)
  useEffect(() => {
    setRouteChanged(true);
  }, [filter, searchTerm, tagsFilter]);

  useEffect(() => {
    if (!isFetching) setRouteChanged(false);
  }, [isFetching]);

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
  // Another idea would be to revalidate filtered routes (ie. asc, desc, favorites) immediately, and then
  // refresh the dynamic routes (tags and search) on page load. Might be the best compromise, because that way
  //each update is only ~3 api calls
  if (
    (data === undefined && status !== "success") ||
    status === "pending" ||
    (isFetching &&
      !isDefaultRevalidatedPath(filter, searchTerm, tagsFilter) &&
      routeChanged)
  ) {
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
