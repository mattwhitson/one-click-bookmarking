import { Hono } from "hono";
import { validator } from "hono/validator";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { parse } from "node-html-parser";
import { cleanUpUrl } from "@/lib/utils";
import { db } from "@/db";
import {
  bookmarks,
  bookmarksRecentlyCreated,
  bookmarksToTags,
  tags,
} from "@/db/schema";
import { newBookmarkSchema } from "@/lib/zod-schemas";
import { authenticateUser } from "@/auth";
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";

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
  title: string | null;
  imageUrl: string;
  description: string | null;
  lastUpdated: Date | null;
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
  .get("/", async (c) => {
    const userId = await authenticateUser();

    const tagsFilter = c.req.queries("tagsFilter");
    const cursor = Number(c.req.query("cursor"));
    const filter = String(c.req.query("filter"));
    const searchTerm = String(c.req.query("searchTerm"));

    const filterClause =
      filter === "favorites"
        ? and(
            cursor ? lt(bookmarks.id, cursor) : undefined,
            eq(bookmarks.favorite, true)
          )
        : filter === "ascending"
        ? cursor
          ? gt(bookmarks.id, cursor)
          : undefined
        : cursor
        ? lt(bookmarks.id, cursor)
        : undefined;

    const searchClause =
      searchTerm !== "undefined"
        ? and(
            and(
              or(
                or(
                  or(
                    ilike(bookmarks.url, `%${searchTerm}%`),
                    ilike(bookmarks.title, `%${searchTerm}%`)
                  ),
                  ilike(bookmarks.description, `%${searchTerm}%`)
                ),
                ilike(tags.tag, `%${searchTerm}%`)
              ),
              eq(bookmarks.userId, userId)
            ),
            filterClause
          )
        : and(eq(bookmarks.userId, userId), filterClause);

    const whereClause =
      tagsFilter && tagsFilter.length > 0
        ? and(searchClause, inArray(tags.tag, tagsFilter))
        : searchClause;

    const orderByClause =
      filter === "ascending"
        ? asc(bookmarks.createdAt)
        : desc(bookmarks.createdAt);

    try {
      const temp = await db
        .select({
          id: bookmarks.id,
        })
        .from(bookmarks)
        .leftJoin(bookmarksToTags, eq(bookmarks.id, bookmarksToTags.bookmarkId))
        .leftJoin(tags, eq(tags.id, bookmarksToTags.tagId))
        .where(whereClause)
        .limit(BOOKMARK_BATCH_SIZE)
        .groupBy(bookmarks.id)
        .orderBy(orderByClause);

      const ids = temp.map((temp) => temp.id);
      if (!ids.length) {
        return c.json({
          bookmarks: [] as BookmarksWithTags[],
          cursor: undefined as number | undefined,
        });
      }

      // obviously this sucks because i'm doing an extra query for no reason but i have no idea how to create the
      // query correctly so that if there is one element in the array_agg then i should return all of them
      // because ilike(tags.tag, `%${searchTerm}%`) will only return the tags the correctly pattern match the search term,
      // when i want it to return all the elements if one matches
      const data = await db
        .select({
          id: bookmarks.id,
          url: bookmarks.url,
          favorite: bookmarks.favorite,
          createdAt: bookmarks.createdAt,
          tags: sql<
            Tag[]
          >`json_agg(json_build_object('id', ${tags.id}, 'tag', ${tags.tag}))`,
          title: bookmarks.title,
          imageUrl: bookmarks.imageUrl,
          description: bookmarks.description,
          lastUpdated: bookmarks.lastUpdated,
        })
        .from(bookmarks)
        .leftJoin(bookmarksToTags, eq(bookmarks.id, bookmarksToTags.bookmarkId))
        .leftJoin(tags, eq(tags.id, bookmarksToTags.tagId))
        .where(inArray(bookmarks.id, ids))
        .limit(BOOKMARK_BATCH_SIZE)
        .groupBy(bookmarks.id)
        .orderBy(orderByClause);

      for (const bookmark of data) {
        if (bookmark.tags[0].id === null) bookmark.tags = [];
      }

      let nextCursor = undefined;
      if (data.length === BOOKMARK_BATCH_SIZE) {
        nextCursor = data[BOOKMARK_BATCH_SIZE - 1].id;
      }

      // we'll try to update the metadata 3 days after the last time it was updated
      for (const bookmark of data) {
        if (
          !bookmark.lastUpdated ||
          Date.now() - bookmark.lastUpdated.getTime() > 1000 * 3600 * 72
        ) {
          const meta = await getMetadata(bookmark.url);
          bookmark.title = meta.title;
          bookmark.description = meta.description;
          bookmark.imageUrl = meta.image;

          await db
            .update(bookmarks)
            .set({
              title: bookmark.title,
              description: bookmark.description,
              imageUrl: bookmark.imageUrl,
              lastUpdated: sql`now()`,
            })
            .where(eq(bookmarks.id, bookmark.id));
        }
      }
      console.log(filter, searchTerm, tagsFilter);
      console.log(data);
      return c.json({
        bookmarks: data,
        cursor: nextCursor,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }
  })
  .get(
    "/favorites",
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
        const data: BookmarksWithTags[] = await db
          .select({
            id: bookmarks.id,
            url: bookmarks.url,
            favorite: bookmarks.favorite,
            createdAt: bookmarks.createdAt,
            tags: sql<
              Tag[]
            >`json_agg(json_build_object('id', ${tags.id}, 'tag', ${tags.tag}))`,
            title: bookmarks.title,
            imageUrl: bookmarks.imageUrl,
            description: bookmarks.description,
            lastUpdated: bookmarks.lastUpdated,
          })
          .from(bookmarks)
          .leftJoin(
            bookmarksToTags,
            eq(bookmarks.id, bookmarksToTags.bookmarkId)
          )
          .leftJoin(tags, eq(tags.id, bookmarksToTags.tagId))
          .where(
            and(
              and(
                eq(bookmarks.userId, userId),
                cursor ? lt(bookmarks.id, cursor) : undefined
              ),
              eq(bookmarks.favorite, true)
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

        // we'll try to update the metadata 3 days after the last time it was updated
        for (const bookmark of data) {
          if (
            !bookmark.lastUpdated ||
            Date.now() - bookmark.lastUpdated.getTime() > 1000 * 3600 * 72
          ) {
            const meta = await getMetadata(bookmark.url);
            bookmark.title = meta.title;
            bookmark.description = meta.description;
            bookmark.imageUrl = meta.image;

            await db
              .update(bookmarks)
              .set({
                title: bookmark.title,
                description: bookmark.description,
                imageUrl: bookmark.imageUrl,
                lastUpdated: sql`now()`,
              })
              .where(eq(bookmarks.id, bookmark.id));
          }
        }

        return c.json(
          {
            bookmarks: data,
            cursor: nextCursor,
          },
          200
        );
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )
  .get("/all", async (c) => {
    const userId = await authenticateUser();
    try {
      const data = await db
        .select({
          url: bookmarks.url,
          title: bookmarks.title,
          description: bookmarks.description,
          favorite: bookmarks.favorite,
          imageUrl: bookmarks.imageUrl,
        })
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .groupBy(bookmarks.id)
        .orderBy(desc(bookmarks.createdAt));

      for (const bookmark of data) {
        const meta = await getMetadata(bookmark.url);
        bookmark.title = meta.title;
        bookmark.description = meta.description;
        bookmark.imageUrl = meta.image;
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

    const userId = await authenticateUser();

    if (!url) {
      throw new HTTPException(400, { message: "Missing url" });
    }

    let hasRecentBookmarksRecord = false;
    try {
      const recentBookmarks = await db
        .select({
          counter: bookmarksRecentlyCreated.count,
          createdAt: bookmarksRecentlyCreated.createdAt,
        })
        .from(bookmarksRecentlyCreated)
        .where(eq(bookmarksRecentlyCreated.userId, userId));
      // check if user has reached their daily bookmark limit

      if (recentBookmarks[0]) {
        if (
          recentBookmarks[0].createdAt.getTime() - Date.now() >
          1000 * 3600 * 24
        ) {
          await db
            .delete(bookmarksRecentlyCreated)
            .where(eq(bookmarksRecentlyCreated.userId, userId));
        } else if (recentBookmarks[0].counter >= 100) {
          const newTime = new Date(
            recentBookmarks[0].createdAt.getTime() + 1000 * 3600 * 24
          ).toString();
          return c.json(
            {
              error: `You've reached your daily bookmark limit! Please wait until ${newTime}`,
            },
            400
          );
        } else {
          hasRecentBookmarksRecord = true;
        }
      }
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
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
      .where(
        and(
          or(eq(bookmarks.url, copy), eq(bookmarks.url, url)),
          eq(bookmarks.userId, userId)
        )
      );

    if (result[0].count > 0) {
      return c.json({ error: "Bookmark already exists!" }, 409);
    }

    const meta = await getMetadata(url);

    try {
      const bookmark = await db
        .insert(bookmarks)
        .values({
          url,
          favorite: false,
          userId: userId,
          imageUrl: meta.image,
          title: meta.title,
          description: meta.description,
        })
        .returning();

      const metadata: Metadata = await getMetadata(bookmark[0].url);
      metadata.bookmarkId = bookmark[0].id;

      if (hasRecentBookmarksRecord) {
        await db
          .update(bookmarksRecentlyCreated)
          .set({ count: sql`${bookmarksRecentlyCreated.count} + 1` })
          .where(eq(bookmarksRecentlyCreated.userId, userId));
      } else {
        await db
          .insert(bookmarksRecentlyCreated)
          .values({ userId: userId, count: 1 });
      }

      return c.json({ bookmark: bookmark[0] }, 200);
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

      try {
        const updatedBookmark = await db
          .update(bookmarks)
          .set({ favorite })
          .where(eq(bookmarks.id, Number(id)))
          .returning();

        return c.json({ data: updatedBookmark[0] });
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )
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
