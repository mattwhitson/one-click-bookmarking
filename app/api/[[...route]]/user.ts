import { authenticateUser } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

const app = new Hono().delete(
  "/:userId",
  validator("param", (value, c) => {
    const userId = value["userId"];
    return {
      userId,
    };
  }),
  async (c) => {
    const id = await authenticateUser();
    const userId = c.req.param("userId");

    if (userId !== id) {
      throw new HTTPException(404, { message: "Nice try bub." });
    }

    try {
      await db.delete(users).where(eq(users.id, userId));

      return c.json({ message: "Account deleted successfully" }, 200);
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, { message: "Database Error" });
    }
  }
);

export default app;
