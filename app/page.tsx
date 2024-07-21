import { Carousel } from "@/components/carousel/index";
import { InfoAccordian } from "@/components/landing-page/info-accordian";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex h-[calc(100% - 3rem)] flex-col items-center pt-14 sm:pt-48 px-4  max-w-3xl mx-auto">
        <section className="mt-16 sm:mt-0">
          <div className="text-center items-center flex flex-col gap-y-2 sm:gap-y-4">
            <h1 className="text-4xl font-bold sm:text-6xl">
              One Click{" "}
              <em className="not-italic font-bold text-cyan-500">
                Bookmarking
              </em>
            </h1>
            <p className="dark:text-stone-300 text-sm sm:text-base">
              You&apos;re one stop shop for all your bookmarking needs!
            </p>
            <Button variant="default" className="rounded-xl group my-2" asChild>
              <Link href="/login">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1/4 transition-transform" />
              </Link>
            </Button>
            <p className="pt-8 text-base font-semibold sm:text-2xl sm:pt-24 ">
              Start making your marks today. It&apos;s{" "}
              <em className="not-italic font-bold text-cyan-500">free</em>, and
              always will be.
            </p>
            <p className="text-sm">What are you waiting for?</p>
          </div>
        </section>
        <Carousel />
        <section className="mt-6 sm:mt-24 text-3xl sm:font-4xl font-semibold w-full flex flex-col items-center">
          <h3>What We Offer:</h3>
          <InfoAccordian />
        </section>
      </main>
      <footer className="w-full h-36 mt-12 border-t-[1px] dark:border-zinc-900">
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
    </>
  );
}
