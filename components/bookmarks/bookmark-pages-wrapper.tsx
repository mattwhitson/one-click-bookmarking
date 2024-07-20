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
  let response;
  if (params.queryKey[1] === "/bookmarks") {
    let searchTerm = "undefined";
    if (params.queryKey[2] !== undefined) {
      searchTerm = params.queryKey[2];
    }
    response = await client.api.bookmarks.$get(
      {
        query: { cursor: "undefined", searchTerm: searchTerm },
      },
      { headers: cookie }
    );
  } else if (params.queryKey[1] === "/favorites") {
    response = await client.api.bookmarks.favorites.$get(
      {
        query: {
          cursor: "undefined",
        },
      },
      { headers: cookie }
    );
  }

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
  searchParam?: string | string[] | undefined;
}

export default async function BookmarksPageWrapper({
  path,
  searchParam,
}: Props) {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = new QueryClient();

  let queryKey = path;

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["userBookmarks", queryKey, searchParam],
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
        <Bookmarks searchTerm={searchParam} />
      </HydrationBoundary>
    </main>
  );
}
