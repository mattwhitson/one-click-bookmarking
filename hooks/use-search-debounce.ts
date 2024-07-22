"use client";

import { MutableRefObject, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function useSearchDebounce(
  searchTerm: string,
  searchInputRef: MutableRefObject<HTMLInputElement | null>,
  delay: number
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const filterParam = searchParams.get("filter");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm, router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (document.activeElement !== searchInputRef.current) return;
      setSearch(searchTerm);
      if (searchTerm !== "")
        router.push(
          `/bookmarks?${
            filterParam ? `filter=${filterParam}&` : ""
          }search=${searchTerm}`
        );
      else if (searchParam) router.push("/bookmarks");
    }, delay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return search;
}
