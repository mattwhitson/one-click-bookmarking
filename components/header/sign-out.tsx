"use client";

import { Session } from "next-auth";
import Link from "next/link";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

interface Props {
  session: Session | null;
}

export function SignOut({ session }: Props) {
  return (
    session && (
      <Button className="rounded-2xl" asChild onClick={() => signOut()}>
        <Link href="/login">Logout</Link>
      </Button>
    )
  );
}
