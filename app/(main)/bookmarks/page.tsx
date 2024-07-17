import { FiDisc } from "react-icons/fi";
import { getBookmarks } from "@/actions/get-bookmarks";
import { Card } from "@/components/bookmarks/card";

export default async function Bookmarks() {
  const data = await getBookmarks();
  const { bookmarks } = await data.json();
  console.log(bookmarks);
  return (
    <main className="w-full min-h-full border-l-[1px] dark:border-zinc-900">
      {bookmarks.map(({ id, favorite, url }) => (
        <Card key={id} id={id} favorite={favorite} url={url} />
      ))}
    </main>
  );
}
