import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export function useGetTags(userId?: string) {
  const query = useQuery({
    queryKey: ["tags", userId],
    queryFn: async (params) => {
      const [_, userId] = params.queryKey;
      if (userId === undefined) return [];
      console.log("hey");
      const response = await client.api.tags.$get({ query: { userId } });

      if (!response.ok) {
        throw new Error("Failed to fetch your tags!");
      }

      const { tags } = await response.json();

      return tags;
    },
  });

  return query;
}
