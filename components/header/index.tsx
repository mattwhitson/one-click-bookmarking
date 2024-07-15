import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/header/theme-toggle";
import { SignOut } from "@/components/header/sign-out";
import { auth } from "@/auth";

export async function Header() {
  const session = await auth();
  return (
    <header className="mx-auto w-auto max-w-4xl p-4 flex items-center">
      <Link href="/" className="mr-auto">
        <Image
          src="/Bookmark-dynamic-gradient.png"
          alt="Logo"
          width={48}
          height={48}
        />
      </Link>

      <SignOut session={session} />

      <ThemeToggle />
    </header>
  );
}
