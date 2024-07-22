import BookmarksPageWrapper from "@/components/bookmarks/bookmark-pages-wrapper";

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <BookmarksPageWrapper
      path={"/bookmarks"}
      filter={searchParams?.["filter"]}
      searchTerm={searchParams?.["search"]}
    />
  );
}
