import Image from "next/image";
import Link from "next/link";

import { MenuIcon } from "lucide-react";
import { ThemeToggle } from "@/components/header/theme-toggle";
import { SignOut } from "@/components/header/sign-out";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();
  return (
    <header className="mx-auto w-full border-b-[1px] dark:border-zinc-900 fixed backdrop-blur-xl z-20">
      <div className="mx-auto w-auto max-w-4xl flex items-center  px-4 py-2">
        {session && (
          <Button variant="ghost" className="sm:hidden h-12 w-12 p-0 mr-auto">
            <MenuIcon className="h-8 w-8" />
          </Button>
        )}
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

        <SignOut session={session} />

        <ThemeToggle />
      </div>
    </header>
  );
}
