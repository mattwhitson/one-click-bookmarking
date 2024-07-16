import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { newBookmarkSchema } from "@/lib/zod-schemas";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/", async (c) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    let data;
    try {
      data = await db
        .select({
          id: bookmarks.id,
          categories: bookmarks.categories,
          url: bookmarks.url,
          favorite: bookmarks.favorite,
        })
        .from(bookmarks)
        .where(eq(bookmarks.userId, session.user.id));
    } catch {
      throw new HTTPException(500, { message: "Database Error" });
    }

    return c.json({
      bookmarks: data,
    });
  })

  .post("/", zValidator("json", newBookmarkSchema), async (c) => {
    const body = c.req.valid("json");
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    if (!body) {
      throw new HTTPException(400, { message: "Missing url" });
    }

    try {
      await db.insert(bookmarks).values({
        url: body.url,
        favorite: false,
        categories: "test",
        userId: session.user.id,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }

    return c.json({ message: "Successfully created toast" }, 200);
  });

export default app;
