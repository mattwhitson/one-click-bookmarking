import { auth } from "@/auth";

export default async function Bookmarks() {
  const session = await auth();
  return <main>HELLO World</main>;
}
