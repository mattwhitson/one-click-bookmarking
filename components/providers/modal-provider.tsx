import { AddBookmarkModal } from "../bookmarks/add-bookmark-modal";
import { ChangeTagsModal } from "../bookmarks/add-tags-modal";

export function ModalProvider() {
  return (
    <>
      <AddBookmarkModal />
      <ChangeTagsModal />
    </>
  );
}
