import Link from "next/link";
import { File, HomeIcon, Plus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sidebar/sign-out";
import { AddBookmarkButton } from "@/components/sidebar/add-bookmark-button";
import { auth } from "@/auth";

export async function Sidebar() {
  const session = await auth();
  return (
    <nav className="hidden sm:flex flex-col rounded-sm min-w-20 items-center gap-y-6 pb-6 py-1 fixed mt-20">
      <Button variant="ghost" className="h-12 w-12 p-0">
        <Link href="/bookmarks">
          <HomeIcon className="w-8 h-8" />
        </Link>
      </Button>
      <AddBookmarkButton />
      <Button variant="ghost" className="h-12 w-12 p-0">
        <Search className="w-8 h-8" />
      </Button>
      <Button asChild variant="ghost" className="h-12 w-12 p-0">
        <Link href="/favorites">
          <Star className="w-8 h-8" />
        </Link>
      </Button>
      <Button asChild variant="ghost" className="h-12 w-12 p-0">
        <Link href="/export">
          <File className="w-8 h-8" />
        </Link>
      </Button>
      <SignOut session={session} />
    </nav>
  );
}
