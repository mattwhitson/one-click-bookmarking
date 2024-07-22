import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetBookmarks(
  filter: string | string[] | undefined,
  searchTerm: string | string[] | undefined
) {
  const fetchBookmarks = async ({
    pageParam = undefined,
  }: {
    pageParam: number | undefined;
  }) => {
    const response = await client.api.bookmarks.$get({
      query: {
        cursor: String(pageParam),
        filter: filter,
        searchTerm: searchTerm,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch your bookmarks!");
    }

    const { bookmarks, cursor } = await response.json();
    console.log("hi", filter, searchTerm);
    return { bookmarks, cursor };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["userBookmarks", filter, searchTerm],
    queryFn: fetchBookmarks,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.cursor,
    refetchInterval: false,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  };
}
