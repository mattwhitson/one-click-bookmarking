import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function InfoAccordian() {
  return (
    <Accordion type="single" collapsible className="w-full mt-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl">
          Mark your favorite links
        </AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          Ever struggle to find that bookmark you saved six months ago? With One
          Click Bookmarking you can easily add bookmarks to your favorites list
          to easily keep track of your favorite links!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-xl">
          Create custom tags
        </AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          Want to organize your bookmarks into categories? With our tag system,
          finding bookmarks related to a specific thing is just one search away!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-xl">Export to CSV</AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          Save your bookmarks to a CSV file in seconds.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="text-xl">
          A generous daily limit
        </AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          You can save up to 100 bookmarks a day and can have up to 100 active
          tags at any one time. Unfortunately, this limit is in place to ensure
          our database doesn&apos;t get flooded with bots. Sorry for any
          incovenience ❤️
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger className="text-xl">Privacy</AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          To make things clear, we don&apos;t sell your data to anyone. And, if
          you decide to delete your account, all your bookmarks and user
          information are deleted the moment you close your account
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger className="text-xl">
          And did we mention...
        </AccordionTrigger>
        <AccordionContent className="font-normal text-base">
          It&apos;s <em>free!</em>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
