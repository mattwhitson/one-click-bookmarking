import { Carousel } from "@/components/carousel/index";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-[calc(100% - 3rem)] flex-col items-center pt-14 sm:pt-48 px-4">
      <section className="">
        <div className="text-center items-center flex flex-col gap-y-2 max-w-3xl sm:gap-y-4">
          <h1 className="text-4xl font-bold sm:text-6xl">
            One Click{" "}
            <em className="not-italic font-bold text-cyan-500">Bookmarking</em>
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
    </main>
  );
}
