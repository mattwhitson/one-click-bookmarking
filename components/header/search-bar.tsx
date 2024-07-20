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

function useDebounce(searchTerm: string, delay: number) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return search;
}

async function fetchSearchResults(params: any) {
  const [_, search] = params.queryKey;

  const response = await client.api.bookmarks.search.$get({
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
    queryKey: ["userBookmarks", search],
    queryFn: fetchSearchResults,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.cursor,
    refetchInterval: false,
  });
};

export function SearchBar({ session }: { session: Session }) {
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
    console.log(values);
  }

  return (
    <>
      {session && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="hidden translate-y-1 h-fit w-[512px] sm:block relative"
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
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="absolute right-1 w-18 h-8 top-[8%] rounded-sm"
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
