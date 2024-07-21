"use client";

import { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { searchSchema } from "@/lib/zod-schemas";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/hooks/modal-store";
import { useDebouncedQuery } from "@/hooks/use-debounced-query";

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
