import { Hono, Context } from "hono";
import { handle } from "hono/vercel";
import bookmarks from "@/app/api/[[...route]]/bookmarks";
import tags from "@/app/api/[[...route]]/tags";
import { HTTPException } from "hono/http-exception";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    // Get the custom response
    return error.getResponse();
  }
  console.log(error);
  return c.json({ message: "Internal error" }, 500);
});

const routes = app.route("/bookmarks", bookmarks).route("/tags", tags);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
