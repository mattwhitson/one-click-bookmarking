import { create } from "zustand";

export enum ModalTypes {
  AddBookmark,
}

interface ModalState {
  type: ModalTypes | null;
  isOpen: boolean;
  onOpen: (type: ModalTypes) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type: ModalTypes) => set({ type: type, isOpen: true }),
  onClose: () => set({ type: null, isOpen: false }),
}));
