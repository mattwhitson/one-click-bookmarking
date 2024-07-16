import { auth } from "@/auth";

export default async function Bookmarks() {
  const session = await auth();
  return (
    <main className="w-full min-h-[calc(100%-5rem)] border-l-[1px] dark:border-zinc-900 py-2 px-4">
      whatsup
    </main>
  );
}
