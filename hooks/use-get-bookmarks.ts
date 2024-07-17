import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetBookmarks() {
  const query = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const response = await client.api.bookmarks.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch your bookmarks!");
      }

      const { bookmarks } = await response.json();

      return bookmarks;
    },
  });

  return query;
}
