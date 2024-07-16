"use server";

import { auth } from "@/auth";
import { client } from "@/lib/hono";
import { redirect } from "next/navigation";

export async function getBookmarks() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");

  const bookmarks = await client.api.bookmarks.$get({
    query: { userId: session.user.id },
  });

  return bookmarks;
}
