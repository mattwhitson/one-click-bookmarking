import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/lib/hono";
import { Bookmarks } from "@/components/bookmarks/index";
import { headers } from "next/headers";

type BookmarksWithTagsAndMetadata = {
  bookmarks: {
    id: number;
    url: string;
    favorite: boolean;
    createdAt: string | null;
    tags: {
      id: number;
      tag: string;
    }[];
  }[];
  cursor: number | undefined;
  metadata: {
    title: string;
    image: string;
    description: string;
    bookmarkId: number;
  }[];
};

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

export default async function BookmarksPage() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["userBookmarks"],
    queryFn: getBookmarks,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => lastPage?.cursor,
  });

  await queryClient.prefetchQuery({
    queryKey: ["tags", userId],
    queryFn: getTags,
  });

  return (
    <main className="w-full min-h-full border-l-[1px] dark:border-zinc-900 mt-16 sm:ml-20 pb-16">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Bookmarks favorites={false} />
      </HydrationBoundary>
    </main>
  );
}
