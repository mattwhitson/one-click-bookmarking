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

const app = new Hono()
  .get("/", async (c) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    const userId = session.user.id;

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
        .leftJoin(bookmarksToTags, eq(bookmarks.id, bookmarksToTags.bookmarkId))
        .leftJoin(tags, eq(tags.id, bookmarksToTags.tagId))
        .where(eq(bookmarks.userId, userId))
        .groupBy(bookmarks.id);

      for (const bookmark of data) {
        if (bookmark.tags[0].id === null) bookmark.tags = [];
      }

      return c.json({
        bookmarks: data,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }
  })

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
  })
  .patch(
    "/:id",
    validator("json", (value, c) => {
      const favorite = value["favorite"];
      if (typeof favorite !== "boolean") {
        throw new HTTPException(404, { message: "Body missing." });
      }

      return {
        favorite,
      };
    }),
    async (c) => {
      const session = await auth();

      if (!session || !session.user || !session.user.id) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const userId = session.user.id;

      const id = c.req.param("id");
      const { favorite } = c.req.valid("json");
      let updatedBookmark;
      try {
        updatedBookmark = await db
          .update(bookmarks)
          .set({ favorite })
          .where(eq(bookmarks.id, Number(id)))
          .returning();
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
      return c.json({ data: updatedBookmark[0] });
    }
  )
  //TODO: change schema and make it a cascade delete for this bad boy and also for tags,
  // because right now i can't delete them without deleting all the rows in the child table
  // connecting bookmarks and tags
  .delete(
    "/:bookmarkId",
    validator("param", (value, c) => {
      const bookmarkId = value["bookmarkId"];
      if (!bookmarkId || typeof bookmarkId !== "string") {
        throw new HTTPException(404, { message: "Missing bookmark id" });
      }

      return {
        bookmarkId,
      };
    }),
    async (c) => {
      const bookmarkId = c.req.param("bookmarkId");
      const session = await auth();

      if (!session || !session.user || !session.user.id) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      try {
        await db.delete(bookmarks).where(eq(bookmarks.id, Number(bookmarkId)));
        return c.json({ message: "Deletion succeeded" }, 200);
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  );

export default app;
