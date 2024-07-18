"use server";

import { cleanUpUrl } from "@/lib/utils";
import { parse } from "node-html-parser";

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

type MetaTagTypes = (typeof metaTags)[number];

export interface Metadata {
  title: string;
  image: string;
  description: string;
}

export async function getMetadata(url: string) {
  const meta = {} as Metadata;
  const data: { [key: MetaTagTypes[number]]: string } = {};
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "mattwhitson.dev Bot",
      },
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
    throw new Error("Failed to fetch your bookmarks!");
  }
  return meta;
}
