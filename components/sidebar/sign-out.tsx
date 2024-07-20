import Image from "next/image";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

interface Props {
  session: Session | null;
}

export function SignOut({ session }: Props) {
  return (
    session && (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
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
      </form>
    )
  );
}
