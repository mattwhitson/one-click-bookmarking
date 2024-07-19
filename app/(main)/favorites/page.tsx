import { auth } from "@/auth";
import { Bookmarks } from "@/components/bookmarks";
import { client } from "@/lib/hono";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getBookmarks({ pageParam = undefined }) {
  const cookie: Record<string, string> = {
    Cookie: headers().get("Cookie")!,
  };

  const response = await client.api.bookmarks.$get(
    {
      query: { cursor: "undefined" },
    },
    { headers: cookie }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { bookmarks, cursor, metadata } = await response.json();
  return { bookmarks, cursor, metadata };
}

async function getTags(params: { queryKey: string[] }) {
  const [_, userId] = params.queryKey;
  const cookie: Record<string, string> = {
    Cookie: headers().get("Cookie")!,
  };

  const response = await client.api.tags.$get(
    {
      query: { userId: userId },
    },
    { headers: cookie }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { tags } = await response.json();
  return tags;
}

export default async function Favorites() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  const queryClient = new QueryClient();

  const userId = session.user.id;

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["userBookmarks"],
    queryFn: getBookmarks,
    initialPageParam: undefined,
  });

  await queryClient.prefetchQuery({
    queryKey: ["tags", userId],
    queryFn: getTags,
  });

  return (
    <main className="w-full min-h-full border-l-[1px] dark:border-zinc-900 sm:ml-20 mt-16">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Bookmarks favorites />
      </HydrationBoundary>
    </main>
  );
}
