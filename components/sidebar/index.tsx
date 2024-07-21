import Link from "next/link";
import { File, HomeIcon, Plus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sidebar/sign-out";
import { AddBookmarkButton } from "@/components/sidebar/add-bookmark-button";
import { auth } from "@/auth";
import Image from "next/image";
import { SidebarDropdown } from "./sidebar-dropdown";

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
      {session && (
        <SidebarDropdown
          dropdownTrigger={
            <Button
              className="rounded-full relative p-0 h-10 w-10 mt-auto"
              type="submit"
            >
              <Image
                src={session.user?.image ?? "/Bookmark-dynamic-gradient.png"}
                alt="user profile pciture"
                className="absolute object-fill rounded-full"
                width={48}
                height={48}
              />
            </Button>
          }
        >
          <SignOut session={session} />
        </SidebarDropdown>
      )}
    </nav>
  );
}
