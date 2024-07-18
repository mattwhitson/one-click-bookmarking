import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetTags(userId: string) {
  const query = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await client.api.tags.$get({ query: { userId } });

      if (!response.ok) {
        throw new Error("Failed to fetch your bookmarks!");
      }

      const { tags } = await response.json();

      return tags;
    },
  });

  return query;
}
