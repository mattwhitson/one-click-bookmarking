import { Session } from "next-auth";
import { Button } from "../ui/button";
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
        <Button className="rounded-2xl" type="submit">
          Logout
        </Button>
      </form>
    )
  );
}
