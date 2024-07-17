"use client";

import { Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";

export function Bookmarks() {
  const { data: bookmarks } = useGetBookmarks();

  return (
    <>
      {bookmarks?.map(({ id, favorite, url, tags }) => (
        <Card key={id} id={id} favorite={favorite} url={url} tags={tags} />
      ))}
    </>
  );
}
