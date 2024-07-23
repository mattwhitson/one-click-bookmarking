import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanUpUrl(url: string) {
  const copy = new URL(url);
  return copy.hostname;
}

export const autoInvalidatedPaths = [undefined, "favorites", "ascending"];
