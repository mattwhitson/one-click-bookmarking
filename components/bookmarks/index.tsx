"use client";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/bookmarks/card";
import { useGetBookmarks } from "@/hooks/use-get-bookmarks";
import { useGetTags } from "@/hooks/use-get-tags";
import { useRouter } from "next/navigation";

interface Props {
  favorites: boolean;
}

export function Bookmarks({ favorites }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data } = useGetBookmarks();
  const allTags = useGetTags(session?.user?.id!);

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
        <Card
          key={id}
          id={id}
          favorite={favorite}
          url={url}
          tags={tags}
          allTags={allTags.data}
        />
      ))}
    </>
  );
}
