import { Hono } from "hono";
import { validator } from "hono/validator";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { parse } from "node-html-parser";
import { cleanUpUrl } from "@/lib/utils";
import { db } from "@/db";
import { bookmarks, bookmarksToTags, tags } from "@/db/schema";
import { newBookmarkSchema } from "@/lib/zod-schemas";
import { auth, authenticateUser } from "@/auth";
import { and, asc, count, desc, eq, lt, or, sql } from "drizzle-orm";

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

type MetaTagTypes = (typeof metaTags)[number];

export interface Metadata {
  title: string;
  image: string;
  description: string;
  bookmarkId: number;
}

const BOOKMARK_BATCH_SIZE = 5;

const app = new Hono()
  .get(
    "/",
    validator("query", (value, c) => {
      const cursor = value["cursor"];

      return {
        cursor,
      };
    }),
    async (c) => {
      const userId = await authenticateUser();
      const cursor = Number(c.req.query("cursor"));
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
          .where(
            and(
              eq(bookmarks.userId, userId),
              cursor ? lt(bookmarks.id, cursor) : undefined
            )
          )
          .limit(BOOKMARK_BATCH_SIZE)
          .groupBy(bookmarks.id)
          .orderBy(desc(bookmarks.createdAt));

        for (const bookmark of data) {
          if (bookmark.tags[0].id === null) bookmark.tags = [];
        }

        let nextCursor = undefined;
        if (data.length === BOOKMARK_BATCH_SIZE) {
          nextCursor = data[BOOKMARK_BATCH_SIZE - 1].id;
        }

        let metadata: Metadata[] = [];
        for (const bookmark of data) {
          const meta = await getMetadata(bookmark.url);
          metadata.push(meta);
          metadata[metadata.length - 1].bookmarkId = bookmark.id;
        }

        return c.json({
          bookmarks: data,
          cursor: nextCursor,
          metadata,
        });
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )

  .post("/", zValidator("json", newBookmarkSchema), async (c) => {
    let { url } = c.req.valid("json");

    const userId = await authenticateUser();

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
      return c.json({ message: "Bookmark already exists!" }, 409);
    }

    try {
      const bookmark = await db
        .insert(bookmarks)
        .values({
          url,
          favorite: false,
          userId: userId,
        })
        .returning();

      const metadata: Metadata = await getMetadata(bookmark[0].url);
      metadata.bookmarkId = bookmark[0].id;

      return c.json({ bookmark: bookmark[0], metadata }, 200);
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }
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
      const userId = await authenticateUser();

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
      await authenticateUser();

      try {
        await db.delete(bookmarks).where(eq(bookmarks.id, Number(bookmarkId)));
        return c.json({ message: "Deletion succeeded" }, 200);
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  );

const metaTags = [
  "og:image",
  "og:title",
  "og:description",
  "twitter:image",
  "og:site_name",
  "icon",
  "apple-touch-icon",
  "image",
] as const;

export async function getMetadata(url: string) {
  const meta = {
    title: url,
    description: "",
    image: "/Bookmark-dynamic-gradient.png",
  } as Metadata;
  const data: { [key: MetaTagTypes[number]]: string } = {};
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "mattwhitson.dev Bot",
      },
      signal: AbortSignal.timeout(2000),
    });
    const html = await res.text();
    const parsedHtml = parse(html);

    parsedHtml.querySelectorAll("meta").forEach(({ attributes }) => {
      const property =
        attributes.property ||
        attributes.name ||
        attributes.href ||
        attributes.itemprop;
      if (metaTags.includes(property as MetaTagTypes) && !data[property]) {
        data[property] = attributes.content;
      }
    });

    parsedHtml.querySelectorAll("link").forEach(({ attributes }) => {
      const property = attributes.rel;

      if (metaTags.includes(property as MetaTagTypes) && !data[property]) {
        data[property] = attributes.href || attributes.content;
      }
    });

    meta.title = data["og:title"] || data["og:description"] || cleanUpUrl(url);
    meta.description = data["og:description"];
    meta.image = data["og:image"] || data["twitter:image"];

    if (!meta.image && (data["icon"] || data["apple-touch-icon"])) {
      const pathname = data["icon"] || data["apple-touch-icon"];
      const { protocol, hostname } = new URL(url);
      meta.image = `${protocol}//${hostname}${pathname}`;
    } else if (!meta.image) {
      meta.image = "/Bookmark-dynamic-gradient.png";
    }
  } catch (error) {
    console.log(error);
  }
  return meta;
}

export default app;
