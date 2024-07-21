import { authenticateUser } from "@/auth";
import { db } from "@/db";
import { bookmarksToTags, tags } from "@/db/schema";
import { newTagSchema } from "@/lib/zod-schemas";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { Tag } from "./bookmarks";

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
      const userId = c.req.query("userId");
      await authenticateUser();
      let data;
      try {
        data = await db
          .select({
            id: tags.id,
            tag: tags.tag,
          })
          .from(tags)
          .where(eq(tags.userId, userId!));
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
      return c.json({
        tags: data,
      });
    }
  )
  .post(
    "/",
    zValidator("json", newTagSchema),
    validator("json", (value, c) => {
      console.log(value);
      const bookmarkId = value["bookmarkId"];
      if (!bookmarkId || typeof bookmarkId !== "number") {
        throw new HTTPException(404, { message: "Query param missing." });
      }

      const tag = value["tag"] as string;
      return {
        bookmarkId,
        tag,
      };
    }),
    async (c) => {
      let { tag, bookmarkId } = c.req.valid("json");

      if (!tag) {
        throw new HTTPException(400, { message: "Missing tag" });
      }

      const userId = await authenticateUser();

      try {
        const totalTagsWithUserId = await db
          .select({ count: count() })
          .from(tags)
          .where(eq(tags.userId, userId));

        if (totalTagsWithUserId[0].count >= 100) {
          return c.json(
            {
              error:
                "You've reached your tag limit! Delete some before making a new one!",
            },
            400
          );
        }
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }

      let alreadyExists;
      try {
        alreadyExists = await db
          .select({ count: count() })
          .from(tags)
          .where(eq(tags.tag, tag));

        if (alreadyExists[0].count > 0) {
          return c.json({ error: "Tag already exists!" }, 409);
        }
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }

      try {
        // TODO: maybe try using neon with websockets later because then we could make this a transaction instaed of two seperate db insertions.
        const newTag = await db
          .insert(tags)
          .values({
            tag,
            userId,
          })
          .returning();

        await db.insert(bookmarksToTags).values({
          tagId: newTag[0].id,
          bookmarkId,
        });

        return c.json({ tag: newTag[0] }, 200);
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )
  .patch(
    "/:bookmarkId",
    validator("param", (value, c) => {
      const bookmarkId = value["bookmarkId"];
      if (!bookmarkId || typeof bookmarkId !== "string") {
        throw new HTTPException(404, { message: "Query param missing." });
      }

      return {
        bookmarkId,
      };
    }),
    validator("json", (value, c) => {
      const toBeRemoved = value["toBeRemoved"];
      const toBeAdded = value["toBeAdded"];
      return {
        toBeRemoved,
        toBeAdded,
      };
    }),
    async (c) => {
      const {
        toBeRemoved,
        toBeAdded,
      }: { toBeRemoved: Tag[]; toBeAdded: Tag[] } = await c.req.json();
      await authenticateUser();
      const bookmarkId = Number(c.req.param("bookmarkId"));

      const addedTags = toBeAdded.map((tag) => ({
        tagId: tag.id,
        bookmarkId: bookmarkId,
      }));
      const removedTags = toBeRemoved.map((tag) => tag.id);

      try {
        let deleted,
          added: Tag[] = [];
        if (addedTags.length > 0) {
          let addedTagIds = await db
            .insert(bookmarksToTags)
            .values(addedTags)
            .returning({ id: bookmarksToTags.tagId });

          added = await db
            .select({
              id: tags.id,
              tag: tags.tag,
            })
            .from(tags)
            .where(
              inArray(
                tags.id,
                addedTagIds.map((tag) => tag.id)
              )
            );
        }

        if (removedTags.length > 0) {
          deleted = await db
            .delete(bookmarksToTags)
            .where(
              and(
                eq(bookmarksToTags.bookmarkId, bookmarkId),
                inArray(bookmarksToTags.tagId, removedTags)
              )
            )
            .returning({ id: bookmarksToTags.tagId });
          deleted = deleted.map((tag) => tag.id);
        }

        return c.json(
          {
            added,
            deleted,
            bookmarkId,
          },
          200
        );
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  )
  .delete(
    "/:tagId",
    validator("param", (value, c) => {
      const tagId = value["tagId"];
      if (!tagId || typeof tagId !== "string") {
        throw new HTTPException(404, { message: "Query param missing." });
      }

      return {
        tagId,
      };
    }),
    async (c) => {
      await authenticateUser();
      const tagId = Number(c.req.param("tagId"));

      try {
        await db.delete(tags).where(eq(tags.id, tagId));

        return c.json({ tagId }, 200);
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }
    }
  );

export default app;
