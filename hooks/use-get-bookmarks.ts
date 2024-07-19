import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetBookmarks() {
  const fetchBookmarks = async ({
    pageParam = undefined,
  }: {
    pageParam: number | undefined;
  }) => {
    const response = await client.api.bookmarks.$get({
      query: { cursor: String(pageParam) },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch your bookmarks!");
    }

    const { bookmarks, cursor, metadata } = await response.json();

    return { bookmarks, cursor, metadata };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["userBookmarks"],
      queryFn: fetchBookmarks,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage?.cursor,
      refetchInterval: false,
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
}
