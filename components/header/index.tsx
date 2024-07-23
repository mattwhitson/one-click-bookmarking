import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/header/theme-toggle";
import { auth } from "@/auth";
import { SearchBar } from "@/components/header/search-bar";
import { MobileSidebarButton } from "@/components/header/mobile-sidebar-button";
import { FilterDropdown } from "@/components/header/filter-dropdown";
import { AddBookmarkMobile } from "@/components/header/add-bookmark-mobile";

export async function Header() {
  const session = await auth();
  return (
    <header className="mx-auto w-[calc(100vw)] border-b-[1px] dark:border-zinc-900 fixed backdrop-blur-xl z-20">
      <div className="mx-auto w-auto max-w-4xl flex items-center px-[0.6rem] py-2">
        <MobileSidebarButton session={session} />
        {session && (
          <Link href="/" className="mr-auto hidden sm:inline">
            <Image
              src="/Bookmark-dynamic-gradient.png"
              alt="Logo"
              width={48}
              height={48}
              priority
            />
          </Link>
        )}
        {session && (
          <section className="flex items-center gap-x-1 sm:gap-x-4">
            <div className="space-y-0 hidden sm:block">
              <SearchBar session={session} />
            </div>
            <AddBookmarkMobile />
            <FilterDropdown userId={session.user?.id} />
          </section>
        )}
        {!session && (
          <Link href="/" className="mr-auto">
            <Image
              src="/Bookmark-dynamic-gradient.png"
              alt="Logo"
              width={48}
              height={48}
              priority
            />
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
