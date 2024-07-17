import { create } from "zustand";

export enum ModalTypes {
  AddBookmark,
  AddTag,
}

export type BookmarkData = {
  id: number;
};

interface ModalState {
  type: ModalTypes | null;
  isOpen: boolean;
  data: BookmarkData;
  onOpen: (type: ModalTypes, data: BookmarkData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  data: {} as BookmarkData,
  onOpen: (type: ModalTypes, data: BookmarkData) =>
    set({ type: type, isOpen: true, data: data }),
  onClose: () => set({ type: null, isOpen: false, data: {} as BookmarkData }),
}));
