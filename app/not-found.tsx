import Link from "next/link";

export default function notFound() {
  return (
    <div className="flex flex-col max-w-4xl min-h-full mx-auto overflow-auto justify-center items-center px-4 text-center">
      <h2 className="text-5xl mb-2">404</h2>
      <p className="mx-auto w-fit">
        Uh oh, this is embarassing. It appears this page doesn&apos;t exist.
        Click{" "}
        <Link className="underline" href="/">
          here
        </Link>{" "}
        to go back.
      </p>
    </div>
  );
}
