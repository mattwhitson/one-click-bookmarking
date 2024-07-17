import { Tag } from "@/app/api/[[...route]]/bookmarks";
import { useQuery } from "@tanstack/react-query";
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

export function cleanUpUrl(url: string) {
  const copy = new URL(url);
  return copy.hostname;
}

async function getMetadata(url: string) {
  const meta = {} as Metadata;
  const data: { [key: MetaTagTypes[number]]: string } = {};
  try {
    console.log("URL: ", url);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "mattwhitson.dev Bot",
      },
    });
    console.log(res);
    const html = await res.text();
    const parsedHtml = parse(html);
    if (url === "https://stackoverflow.com") {
      console.log(html);
    }
    parsedHtml.querySelectorAll("meta").forEach(({ attributes }) => {
      const property =
        attributes.property ||
        attributes.name ||
        attributes.href ||
        attributes.itemprop;
      if (metaTags.includes(property as MetaTagTypes) && !data[property]) {
        if (url === "http://google.com") {
          console.log("HEY", attributes);
        }
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

    // TODO: move to another file because this is messy and also add one for link tags as well (maybe?)
  } catch (error) {
    throw new Error("Failed to fetch your bookmarks!");
  }
  return meta;
}

export function useGetMetaInfo(url: string) {
  const query = useQuery({
    queryKey: ["meta-tags", url],
    queryFn: async () => getMetadata(url),
  });

  return query;
}

export async function GetMetaInfoTest(url: string) {
  const meta = await getMetadata(url);
  return meta;
}
