import Image from "next/image";

interface Props {
  image: string;
  alt: string;
  name: string;
  testimonial: string;
}

export function Card({ image, alt, name, testimonial }: Props) {
  return (
    <div className="w-52 bg-stone-300 dark:bg-stone-900 p-4 rounded-md">
      <div className="flex mb-4 items-center">
        <Image src={image} alt={alt} width={48} height={48} className="" />
        <p>{name}</p>
      </div>
      <p className="text-sm">{testimonial}</p>
    </div>
  );
}
