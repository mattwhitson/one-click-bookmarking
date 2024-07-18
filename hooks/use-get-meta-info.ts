import { useQuery } from "@tanstack/react-query";
import { getMetadata } from "@/actions/get-metadata";

export function useGetMetaInfo(url: string) {
  const query = useQuery({
    queryKey: ["meta-tags", url],
    queryFn: async () => getMetadata(url),
  });

  return query;
}
