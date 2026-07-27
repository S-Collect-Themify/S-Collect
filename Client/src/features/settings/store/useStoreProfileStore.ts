import { create } from 'zustand';

interface StoreProfileStore {
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

export const useStoreProfileStore = create<StoreProfileStore>((set) => ({
  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),
}));
