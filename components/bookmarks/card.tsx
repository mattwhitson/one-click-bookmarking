"use client";

import Image from "next/image";
import Link from "next/link";
import { parse } from "node-html-parser";
import { FiDisc, FiTag } from "react-icons/fi";
import { BsStar, BsStarFill } from "react-icons/bs";
import { BookmarkDropdown } from "@/components/bookmarks/bookmark-dropdown";
import { Tag } from "@/app/api/[[...route]]/bookmarks";
import { Button } from "../ui/button";
import {
  cleanUpUrl,
  GetMetaInfoTest,
  Metadata,
} from "@/hooks/use-get-meta-info";
import { useEffect, useState } from "react";

interface Props {
  id: number;
  url: string;
  favorite: boolean;
  tags: Tag[];
}

export function Card({ id, url, favorite, tags }: Props) {
  const [meta, setMeta] = useState<Metadata>();

  useEffect(() => {
    const handleFetch = async (url: string) => {
      const meta = await GetMetaInfoTest(url);
      return meta;
    };
    handleFetch(url).then((data) => setMeta(data));
  }, [url]);

  if (!meta) return null;
  return (
    <div className="flex w-full">
      <article className="sm:min-w-[25%] min-h-full border-r-[1px] dark:border-zinc-900 flex flex-col py-4">
        <div className="mt-[0.65rem] relative">
          <p className="text-center pt-[0.1rem] text-xs pl-3 sm:text-sm sm:text-end pr-3 sm:pr-4">
            Today
          </p>
          <FiDisc className="w-4 h-4 absolute top-1 right-[-0.5rem] bg-background" />
        </div>
      </article>
      <article className="flex flex-col gap-y-4 px-4 mt-2 py-4 w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{meta?.title}</h3>
          <BookmarkDropdown bookmarkId={id} tags={tags} />
        </div>
        <p className="text-sm text-zinc-800 dark:text-zinc-300 line-clamp-3">
          {meta?.description}
        </p>
        <Link
          href={url}
          className="block relative h-64 border-1 w-full sm:w-96 md:w-full mx-auto border-[1px] dark:border-zinc-900 rounded-sm"
        >
          {/*some bug (apparently its on chrome's end https://stackoverflow.com/questions/70454127/image-jumps-during-page-load-object-fit-cover)
             is momentarily stretch image for a half second after load so i'm cache busting it to avoid that jank
             TODO: change priority to only be first ~5 bookmarks on page
          */}
          <Image
            className="object-contain"
            src={`${meta?.image}?${new Date().getTime()}`}
            alt="bookmark site image"
            fill
            priority
            sizes="(max-width: 920px) 100%, 24rem"
          />

          <p className="absolute bottom-0 left-0 text-sm backdrop-blur-3xl p-1 m-1 rounded-md bg-transparent">
            {cleanUpUrl(url)}
          </p>
          <Button className="ml-auto p-0 bg-background text-primary hover:bg-background block absolute bottom-2 right-2">
            <BsStar className="h-6 w-6 text-yellow-500" />
          </Button>
        </Link>
        <div className="flex flex-row gap-x-4 items-center">
          <FiTag className="min-h-6 min-w-6 text-cyan-500" />
          <div className="flex gap-x-4 flex-wrap gap-y-4">
            {tags[0].id !== null &&
              tags.map(({ id, tag }) => (
                <p
                  key={id}
                  className="text-sm bg-zinc-300 dark:bg-zinc-800 p-1 rounded-lg text-nowrap"
                >
                  {tag}
                </p>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}
