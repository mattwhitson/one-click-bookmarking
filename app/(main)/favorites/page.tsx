import { auth } from "@/auth";
import { Bookmarks } from "@/components/bookmarks";
import { client } from "@/lib/hono";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";

async function getBookmarks({ pageParam = 0 }) {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");

  const response = await client.api.bookmarks.$get({
    query: { cursor: "undefined" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { bookmarks, cursor } = await response.json();
  return { bookmarks, cursor };
}

async function getTags() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");

  const response = await client.api.tags.$get({
    query: { userId: session.user?.id },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { tags } = await response.json();
  return tags;
}

export default async function Favorites() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["userBookmarks"],
    queryFn: getBookmarks,
    initialPageParam: undefined,
  });

  await queryClient.prefetchQuery({
    queryKey: ["tags"],
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
