import { Hono, Context } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono();

app.get("/api/world", (c) => {
  return c.json({ message: "hello world" });
});

export const GET = handle(app);
export const POST = handle(app);
