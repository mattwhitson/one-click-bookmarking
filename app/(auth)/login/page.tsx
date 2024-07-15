import { signIn } from "@/auth";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Login() {
  return (
    <main className="w-full h-[calc(100%-5rem)] max-w-3xl mx-auto flex justify-center items-center">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/bookmarks" });
        }}
        className="flex flex-col space-y-8 text-center mb-20"
      >
        <Image
          src="/Bookmark-dynamic-gradient.png"
          alt="Logo"
          width={96}
          height={96}
          className="mx-auto"
        />
        <h2 className="text-2xl font-semibold">One Click Bookmark</h2>
        <Button type="submit">
          <FcGoogle className="mr-3 h-5 w-5" /> Sign in with Google
        </Button>
      </form>
    </main>
  );
}
