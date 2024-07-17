import { z } from "zod";

export const newBookmarkSchema = z.object({
  url: z.string().url({
    message: "Bookmark link must be a valid url.",
  }),
});

export const newTagSchema = z.object({
  tag: z.string().min(1, {
    message: "Tag cannot be empty.",
  }),
});
