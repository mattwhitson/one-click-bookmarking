"use client";

import { MutableRefObject } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { useSearchDebounce } from "@/hooks/use-search-debounce";

async function fetchSearchResults(params: any) {
  const [_, search] = params.queryKey;

  const response = await client.api.bookmarks.$get({
    query: { cursor: String(params.pageParam), searchTerm: search },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch your tags!");
  }

  const { bookmarks, cursor } = await response.json();

  return { bookmarks, cursor };
}

export const useDebouncedQuery = (
  searchTerm: string,
  searchInputRef: MutableRefObject<HTMLInputElement | null>,
  delay: number
) => {
  const search = useSearchDebounce(searchTerm, searchInputRef, delay);
};
