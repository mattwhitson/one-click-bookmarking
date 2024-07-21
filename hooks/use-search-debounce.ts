"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function useSearchDebounce(searchTerm: string, delay: number) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParmam = searchParams.get("search");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm, router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
      if (searchTerm !== "") router.push(`/bookmarks?search=${searchTerm}`);
      else if (searchParmam) router.push("/bookmarks");
    }, delay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return search;
}
