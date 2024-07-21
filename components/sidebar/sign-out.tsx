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
        className="w-full"
      >
        <Button className="w-full" type="submit">
          Sign out
        </Button>
      </form>
    )
  );
}
