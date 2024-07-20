import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetBookmarks(
  searchTerm: string | string[] | undefined,
  query?: string | undefined
) {
  const fetchBookmarks = async ({
    pageParam = undefined,
  }: {
    pageParam: number | undefined;
  }) => {
    let response;
    let search = searchTerm;
    if (search === undefined) {
      search = "undefined";
    }
    if (query === "/bookmarks") {
      response = await client.api.bookmarks.$get({
        query: { cursor: String(pageParam), searchTerm: search },
      });
    } else {
      response = await client.api.bookmarks.favorites.$get({
        query: { cursor: String(pageParam) },
      });
    }

    if (!response.ok) {
      throw new Error("Failed to fetch your bookmarks!");
    }

    const { bookmarks, cursor } = await response.json();

    return { bookmarks, cursor };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["userBookmarks", query, searchTerm],
      queryFn: fetchBookmarks,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage?.cursor,
      refetchInterval: false,
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
}
