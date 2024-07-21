import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { auth } from "@/auth";
import { Tags } from "@/components/tags";

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

export default async function TagsPage() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tags", userId],
    queryFn: getTags,
  });
  return (
    <main className="w-full min-h-full dark:border-zinc-900 mt-16 sm:ml-20 mb-16">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Tags session={session} />
      </HydrationBoundary>
    </main>
  );
}
