import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full h-36 mt-6 sm:mt-16 border-t-[1px] dark:border-zinc-900">
      <div className="max-w-3xl mx-auto text-center p-4 h-full flex flex-col justify-center space-y-2">
        <h3 className="text-2xl font-bold">One Click Bookmarking</h3>
        <p className="text-sm font-semibold">Created with ❤️ by Matt</p>
        <p className="text-sm">
          Find the code on github{" "}
          <Link className="underline" href="https://github.com/mattwhitson">
            here.
          </Link>{" "}
          This code is licensed under the{" "}
          <Link
            className="underline"
            href="https://en.wikipedia.org/wiki/WTFPL"
          >
            WTFPL
          </Link>{" "}
          license.
        </p>
      </div>
    </footer>
  );
}
