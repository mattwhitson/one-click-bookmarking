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

async function getBookmarks(params: any) {
  const cookie: Record<string, string> = {
    Cookie: headers().get("Cookie")!,
  };
  const filter = params.queryKey[1] as string | undefined;
  const searchTerm = params.queryKey[2] as string | undefined;

  const response = await client.api.bookmarks.$get(
    {
      query: {
        cursor: undefined,
        searchTerm,
        filter,
      },
    },
    { headers: cookie }
  );

  if (!response || !response.ok) {
    throw new Error("Failed to fetch your bookmarks!");
  }

  const { bookmarks, cursor } = await response.json();
  return { bookmarks, cursor };
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

interface Props {
  path: string;
  filter?: string | string[] | undefined;
  searchTerm?: string | string[] | undefined;
  tagsFilter?: string | string[] | undefined;
}

export default async function BookmarksPageWrapper({
  path,
  filter,
  searchTerm,
  tagsFilter,
}: Props) {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["userBookmarks", filter, searchTerm, tagsFilter],
    queryFn: getBookmarks,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => lastPage?.cursor,
  });

  await queryClient.prefetchQuery({
    queryKey: ["tags", userId],
    queryFn: getTags,
  });

  return (
    <main className="w-full min-h-full dark:border-zinc-900 mt-16 sm:ml-20 mb-16">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Bookmarks
          filter={filter}
          searchTerm={searchTerm}
          tagsFilter={tagsFilter}
          userId={userId}
        />
      </HydrationBoundary>
    </main>
  );
}
