import Image from "next/image";
import { auth } from "@/auth";
import { AddBookmarkModal } from "@/components/bookmarks/add-bookmark-modal";
import { ChangeTagsModal } from "@/components/bookmarks/add-tags-modal";
import { DeleteAccountModal } from "@/components/sidebar/delete-account-modal";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";
import { SidebarDropdown } from "@/components/sidebar/sidebar-dropdown";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sidebar/sign-out";

export async function ModalProvider() {
  const session = await auth();
  return (
    <>
      <AddBookmarkModal />
      <ChangeTagsModal />
      <DeleteAccountModal />
      <MobileSidebar>
        {session && (
          <SidebarDropdown
            dropdownTrigger={
              <Button
                className="rounded-full p-0 h-14 w-14 mt-auto mx-auto"
                type="submit"
              >
                <Image
                  src={session.user?.image ?? "/Bookmark-dynamic-gradient.png"}
                  alt="user profile pciture"
                  className="absolute object-fill rounded-full"
                  width={64}
                  height={64}
                />
              </Button>
            }
          >
            <SignOut session={session} />
          </SidebarDropdown>
        )}
      </MobileSidebar>
    </>
  );
}
