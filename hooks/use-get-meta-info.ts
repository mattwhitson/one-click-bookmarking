// import { useQuery } from "@tanstack/react-query";
// import { getMetadata } from "@/actions/get-metadata";
// import { client } from "@/lib/hono";
// import { BookmarkClient } from "@/components/bookmarks";

// export function useGetMetaInfo(bookmarks: BookmarkClient | undefined) {
//   const fetchMetadata = async () => {
//     await client.api.metadata.$get({ json: JSON.stringify(urls) });
//   };
//   console.log(bookmarks, !!bookmarks);
//   const urls = bookmarks?.map((bookmark) => bookmark.url);
//   const query = useQuery({
//     queryKey: ["meta-tags", urls],
//     queryFn: fetchMetadata,
//     enabled: !!bookmarks,
//   });

//   return query;
// }
