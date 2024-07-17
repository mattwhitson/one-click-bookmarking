import { Hono } from "hono";
import { validator } from "hono/validator";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db";
import { bookmarks, bookmarksToTags, tags } from "@/db/schema";
import { newBookmarkSchema } from "@/lib/zod-schemas";
import { auth } from "@/auth";
import { and, asc, count, desc, eq, or, sql } from "drizzle-orm";

export interface Tag {
  id: number;
  tag: string;
}
export interface BookmarksWithTags {
  id: number;
  url: string;
  favorite: boolean;
  createdAt: Date | null; // TODO: Remove null when we update the schema
  tags: Tag[];
}

// TODO: Change this to validate userID with session, because right now anyone who has credentials could get anyone else's bookmark
const app = new Hono()
  .get(
    "/",
    validator("query", (value, c) => {
      const userId = value["userId"];
      if (!userId || typeof userId !== "string") {
        throw new HTTPException(404, { message: "Query param missing." });
      }
      return {
        userId,
      };
    }),
    async (c) => {
      const userId = c.req.query("userId")!;

      try {
        // TODO: Sort by created at to get newest on top when we update schema
        const data: BookmarksWithTags[] = await db
          .select({
            id: bookmarks.id,
            url: bookmarks.url,
            favorite: bookmarks.favorite,
            createdAt: bookmarks.createdAt,
            tags: sql<
              Tag[]
            >`json_agg(json_build_object('id', ${tags.id}, 'tag', ${tags.tag}))`,
          })
          .from(bookmarks)
          .leftJoin(
            bookmarksToTags,
            eq(bookmarks.id, bookmarksToTags.bookmarkId)
          )
          .leftJoin(tags, eq(tags.id, bookmarksToTags.tagId))
          .where(eq(bookmarks.userId, userId))
          .groupBy(bookmarks.id);

        return c.json({
          bookmarks: data,
        });
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )

  .post("/", zValidator("json", newBookmarkSchema), async (c) => {
    let { url } = c.req.valid("json");
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    if (!url) {
      throw new HTTPException(400, { message: "Missing url" });
    }

    // All this is basically just making sure this isn't already in the database and, if it is, stop the new bookmark creation
    // Also removing trailing slashes before to ensure we don't add the same bookmark twice
    if (url[url.length - 1] === "/") url = url.slice(0, -1);

    const copyUrl = new URL(url);
    const host = copyUrl.hostname;
    const domains = host.split(".");

    let copy = copyUrl.toString();
    if (domains.length === 2 || domains.length === 3) {
      if (copy.startsWith("https://")) {
        copy = copy.slice(0, 8) + "www." + copy.slice(8);
      } else {
        copy = copy.slice(0, 7) + "www." + copy.slice(7);
      }
    }

    const result = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(or(eq(bookmarks.url, copy), eq(bookmarks.url, url)));

    if (result[0].count > 0) {
      return c.json({ message: "Bookmark already exists!" }, 200);
    }

    try {
      await db.insert(bookmarks).values({
        url,
        favorite: false,
        userId: session.user.id,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }

    return c.json({ message: "Successfully created bookmark" }, 200);
  });

export default app;
