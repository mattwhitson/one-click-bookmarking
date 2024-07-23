"use client";

import { mkConfig, generateCsv, download } from "export-to-csv";
import { File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

const csvConfig = mkConfig({
  useKeysAsHeaders: true,
  filename: "one-click-bookmarks",
});

async function exportToCsv() {
  const response = await client.api.bookmarks.all.$get();
  if (response.ok) {
    const { bookmarks } = await response.json();
    const csv = generateCsv(csvConfig)(bookmarks);
    download(csvConfig)(csv);
  }
}

export function DownloadCsv() {
  return (
    <>
      <Button
        variant="ghost"
        className="h-12 w-12 p-0 hidden sm:inline-block"
        onClick={exportToCsv}
      >
        <File className="w-8 h-8 mx-auto" />
      </Button>
      <Button
        variant="ghost"
        className="p-0 sm:hidden inline-block hover:bg-inherit text-2xl"
        onClick={exportToCsv}
      >
        Export to CSV
      </Button>
    </>
  );
}
