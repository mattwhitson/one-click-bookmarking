"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Session } from "next-auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { searchSchema } from "@/lib/zod-schemas";
import { Button } from "../ui/button";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useModalStore } from "@/hooks/modal-store";

function useDebounce(searchTerm: string, delay: number) {
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

async function fetchSearchResults(params: any) {
  const [_, search] = params.queryKey;

  const response = await client.api.bookmarks.$get({
    query: { cursor: String(params.pageParam), searchTerm: search },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch your tags!");
  }

  const { bookmarks, cursor } = await response.json();

  return { bookmarks, cursor };
}

const useDebouncedQuery = (
  searchTerm: string,
  queryFn: (...args: any[]) => any,
  delay: number
) => {
  const search = useDebounce(searchTerm, delay);
  return useInfiniteQuery({
    queryKey: ["userBookmarks", "/bookmarks", search],
    queryFn: fetchSearchResults,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.cursor,
    refetchInterval: false,
    enabled: searchTerm !== "",
  });
};

export function SearchBar({
  session,
  width,
}: {
  session: Session | null;
  width?: string;
}) {
  const { type, onClose } = useModalStore();
  const [searchInput, setSearchInput] = useState(""); // only have this use state here because the component would stop detecting the useForm state change for some reason
  const router = useRouter();
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  useDebouncedQuery(
    form.getFieldState("searchTerm").invalid
      ? ""
      : form.getValues("searchTerm"),
    fetchSearchResults,
    1000
  );

  function onSubmit(values: z.infer<typeof searchSchema>) {
    if (type) onClose();
    router.push(`/bookmarks?search=${values.searchTerm}`);
  }

  return (
    <>
      {session && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={`mt-8 sm:mt-0 translate-y-1 h-fit sm:w-[512px] sm:block relative ${
              width && width
            }`}
          >
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Search..."
                      {...field}
                      className="pr-24"
                      onChangeCapture={() =>
                        setSearchInput(form.getValues("searchTerm"))
                      }
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="absolute right-1 w-18 h-8 top-[10%] rounded-sm"
              onClickCapture={(e) => e.stopPropagation()}
            >
              Search
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
