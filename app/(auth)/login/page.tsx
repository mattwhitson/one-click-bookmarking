import { signIn } from "@/auth";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <main className="w-full h-[calc(100%-11rem)] sm:h-[calc(100%-14rem)] max-w-3xl mx-auto flex justify-center items-center flex flex-col">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/bookmarks" });
        }}
        className="flex flex-col space-y-8 text-center mb-212"
      >
        <Image
          src="/Bookmark-dynamic-gradient.png"
          alt="Logo"
          width={96}
          height={96}
          className="mx-auto"
        />
        <h2 className="text-2xl font-semibold">One Click Bookmarking</h2>
        <Button type="submit">
          <FcGoogle className="mr-3 h-5 w-5" /> Sign in with Google
        </Button>
      </form>
      <p className="text-xs mt-3 dark:text-zinc-300">
        By signing up you are agreeing to our{" "}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}
