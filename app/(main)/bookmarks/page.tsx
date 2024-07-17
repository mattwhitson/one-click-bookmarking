import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/lib/hono";
import { Bookmarks } from "@/components/bookmarks/index";

async function getBookmarks() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");

  const response = await client.api.bookmarks.$get();

  if (!response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { bookmarks } = await response.json();

  return bookmarks;
}

export default async function BookmarksPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  return (
    <main className="w-full min-h-full border-l-[1px] dark:border-zinc-900">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Bookmarks />
      </HydrationBoundary>
    </main>
  );
}
