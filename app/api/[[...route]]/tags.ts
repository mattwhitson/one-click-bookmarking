import { auth } from "@/auth";
import { db } from "@/db";
import { bookmarksToTags, tags } from "@/db/schema";
import { newTagSchema } from "@/lib/zod-schemas";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

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
      const session = await auth();

      if (!session || !session.user || !session.user.id) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      if (!tag) {
        throw new HTTPException(400, { message: "Missing tag" });
      }

      const userId = session.user.id;

      // TODO: Make sure that an identical tag doesn't already exist for this user before adding new one to database

      try {
        // TODO: maybe try using neon with websockets later because then we could make this a transaction instaed of two seperate db insertions.
        const newTag = await db
          .insert(tags)
          .values({
            tag,
            userId,
          })
          .returning({ id: tags.id });

        await db.insert(bookmarksToTags).values({
          tagId: newTag[0].id,
          bookmarkId,
        });
      } catch (error) {
        console.log(error);
        throw new HTTPException(500, { message: "Database Error" });
      }

      return c.json({ message: "Successfully created bookmark" }, 200);
    }
  );

export default app;
