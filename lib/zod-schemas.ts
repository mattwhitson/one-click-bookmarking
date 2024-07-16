import { z } from "zod";

export const newBookmarkSchema = z.object({
  url: z.string().url({
    message: "Bookmark link must be a valid url.",
  }),
});
