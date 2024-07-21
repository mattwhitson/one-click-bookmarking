"use client";

import { Card } from "./card";

const CARDS = [
  {
    image: "/Bookmark-dynamic-gradient.png",
    alt: "Profile picture",
    name: "Mom",
    testimonial: "Now it's super easy to save recipes I find!",
  },
  {
    image: "/Bookmark-dynamic-gradient.png",
    alt: "Profile picture",
    name: "Dad",
    testimonial: "What's a bookmark?",
  },
  {
    image: "/Bookmark-dynamic-gradient.png",
    alt: "Profile picture",
    name: "Sister",
    testimonial: "Cool bro!",
  },
  {
    image: "/Bookmark-dynamic-gradient.png",
    alt: "Profile picture",
    name: "Brother",
    testimonial: "Doesn't chrome already do that for you?",
  },
  {
    image: "/Bookmark-dynamic-gradient.png",
    alt: "Profile picture",
    name: "Homie Joe",
    testimonial: "Cool bro!",
  },
];

export function Carousel() {
  return (
    <section className="mt-14 sm:mt-28 max-w-[400px] sm:max-w-2xl w-full">
      <h4 className="text-center text-3xl font-semibold">
        Client Testimonials
      </h4>
      <div
        className="flex gap-x-6 h-full group relative overflow-hidden py-4 
      [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]"
      >
        <div className="animate-infinite-scroll w-max flex gap-x-6">
          {CARDS.map(({ name, alt, image, testimonial }) => (
            <Card
              key={name}
              name={name}
              alt={alt}
              image={image}
              testimonial={testimonial}
            />
          ))}
        </div>

        <div className="animate-infinite-scroll flex w-max gap-x-6" aria-hidden>
          {CARDS.map(({ name, alt, image, testimonial }) => (
            <Card
              key={name}
              name={name}
              alt={alt}
              image={image}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
