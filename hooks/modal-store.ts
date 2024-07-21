import { Bookmark } from "@/components/bookmarks/card";
import { create } from "zustand";

export enum ModalTypes {
  AddBookmark,
  ChangeTag,
  DeleteAccount,
  MobileSidebar,
}

export type BookmarkData = {
  bookmark: Bookmark;
};

interface ModalState {
  type: ModalTypes | null;
  isOpen: boolean;
  data: BookmarkData;
  onOpen: (type: ModalTypes, data?: BookmarkData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  data: {} as BookmarkData,
  onOpen: (type: ModalTypes, data?: BookmarkData) =>
    set({ type: type, isOpen: true, data: data }),
  onClose: () => set({ type: null, isOpen: false, data: {} as BookmarkData }),
}));
