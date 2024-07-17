import { AddBookmarkModal } from "../bookmarks/add-bookmark-modal";
import { AddTagModal } from "../bookmarks/add-tags-modal";

export function ModalProvider() {
  return (
    <>
      <AddBookmarkModal />
      <AddTagModal />
    </>
  );
}
