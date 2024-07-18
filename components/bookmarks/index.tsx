"use client";

import { Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { Loader2 } from "lucide-react";

interface Props {
  favorites: boolean;
}

export function Bookmarks({ favorites }: Props) {
  const { data } = useGetBookmarks();

  if (!data) {
    return <Loader2 className="animate-spin mx-auto mt-16 w-12 h-12" />;
  }
  let bookmarks;
  if (favorites) {
    bookmarks = data.filter((bookmark) => bookmark.favorite);
  } else {
    bookmarks = data;
  }
  return (
    <>
      {bookmarks?.map(({ id, favorite, url, tags }) => (
        <Card key={id} id={id} favorite={favorite} url={url} tags={tags} />
      ))}
    </>
  );
}
