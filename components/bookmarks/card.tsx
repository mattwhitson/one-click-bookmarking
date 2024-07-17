import Image from "next/image";
import Link from "next/link";
import { parse } from "node-html-parser";
import { FiDisc, FiTag } from "react-icons/fi";
import { BookmarkDropdown } from "@/components/bookmarks/bookmark-dropdown";
import { Tag } from "@/app/api/[[...route]]/bookmarks";

interface Props {
  id: number;
  url: string;
  favorite: boolean;
  tags: Tag[];
}

const metaTypes = [
  "og:image",
  "og:title",
  "og:description",
  "twitter:image",
  "og:site_name",
];

export interface Metadata {
  "og:title": string | undefined;
  "og:image": string | undefined;
  "og:description": string | undefined;
  "og:site_name": string | undefined;
}

function cleanUpUrl(url: string) {
  const copy = new URL(url);
  return copy.hostname;
}

export async function Card({ id, url, favorite, tags }: Props) {
  const getMetadata = async (url: string) => {
    let data: Metadata = {
      "og:title": undefined,
      "og:image": undefined,
      "og:description": undefined,
      "og:site_name": undefined,
    };
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "mattwhitson.dev Bot" },
      });
      const html = await res.text();
      const parsedHtml = parse(html);

      parsedHtml.querySelectorAll("meta").forEach(({ attributes }) => {
        const property =
          attributes.property || attributes.name || attributes.href;

        if (metaTypes.includes(property) && !data[property as keyof Metadata]) {
          data[property as keyof Metadata] = attributes.content;
        }
      });

      if (data["og:image"] === undefined) {
        data["og:image"] = "/Bookmark-dynamic-gradient.png";
      }

      // TODO: move to another file because this is messy and also add one for link tags as well (maybe?)
    } catch (error) {
      console.log("website is either down or doesn't exist.");
    }
    return data;
  };

  const meta = await getMetadata(url);
  if (!meta) return null;
  console.log(meta);
  return (
    <div className="flex w-full">
      <article className="min-w-[25%] min-h-full border-r-[1px] dark:border-zinc-900 flex flex-col py-4">
        <div className="mt-[0.65rem] relative">
          <p className="text-end pr-4 text-sm pt-[0.1rem]">Today</p>
          <FiDisc className="w-4 h-4 absolute top-1 right-[-0.5rem] bg-background" />
        </div>
      </article>
      <article className="flex flex-col gap-y-4 ml-4 mt-2 py-4 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{meta["og:site_name"]}</h3>
          <BookmarkDropdown bookmarkId={id} />
        </div>
        <p className="text-sm text-zinc-800 dark:text-zinc-300 line-clamp-3">
          {meta["og:description"]}
        </p>
        <Link
          href={url}
          className="block relative h-64 border-1 w-full sm:w-96 md:w-full mx-auto border-[1px] dark:border-zinc-900 rounded-sm"
        >
          {/*some bug (apparently its on chrome's end https://stackoverflow.com/questions/70454127/image-jumps-during-page-load-object-fit-cover)
             is momentarily stretch image for a half second after load so i'm cache bursting it to avoid that jank
          */}
          <Image
            className="object-contain"
            src={`${meta["og:image"]!}?${new Date().getTime()}`}
            alt="bookmark site image"
            fill
            loading="lazy"
          />

          <p className="absolute bottom-0 left-0 text-sm backdrop-blur-3xl p-1 m-1 rounded-md bg-transparent">
            {cleanUpUrl(url)}
          </p>
        </Link>
        <div className="flex flex-row flex-wrap gap-x-4 items-center">
          <FiTag className="h-6 w-6 text-cyan-500" />
          {tags.map(({ id, tag }) => (
            <p
              key={id}
              className="text-sm bg-zinc-300 dark:bg-zinc-800 p-1 rounded-lg"
            >
              {tag}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
