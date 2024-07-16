import { getBookmarks } from "@/actions/get-bookmarks";

export default async function Bookmarks() {
  const data = await getBookmarks();
  const { bookmarks } = await data.json();

  return (
    <main className="w-full min-h-[calc(100%-5rem)] border-l-[1px] dark:border-zinc-900 py-2 px-4">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id}>{JSON.stringify(bookmark)}</div>
      ))}
    </main>
  );
}
