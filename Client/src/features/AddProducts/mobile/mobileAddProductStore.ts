import { create } from 'zustand';

export const TOTAL_STEPS = 3;

export interface Visibility {
  homepage: boolean;
  promotions: boolean;
  searchResults: boolean;
}

interface MobileAddProductStore {
  step: number;
  isLoading: boolean;
  isSuccess: boolean;
  createdThumbnailUrl?: string;

  categories: string[];
  sizes: string[];
  colors: string[];

  quantity: number;
  isActive: boolean;
  visibility: Visibility;

  nextStep: () => void;
  previousStep: () => void;

  addCategory: (value: string) => void;
  removeCategory: (index: number) => void;
  addSize: (value: string) => void;
  removeSize: (index: number) => void;
  addColor: (value: string) => void;
  removeColor: (index: number) => void;

  setQuantity: (value: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;

  setIsActive: (value: boolean) => void;
  setVisibility: (key: keyof Visibility, value: boolean) => void;

  publish: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: 1,
  isLoading: false,
  isSuccess: false,
  createdThumbnailUrl: undefined as string | undefined,
  categories: [] as string[],
  sizes: [] as string[],
  colors: [] as string[],
  quantity: 0,
  isActive: true,
  visibility: {
    homepage: true,
    promotions: true,
    searchResults: true,
  } as Visibility,
};

export const useMobileAddProductStore = create<MobileAddProductStore>(
  (set) => ({
    ...initialState,

    nextStep: () =>
      set((state) => ({ step: Math.min(state.step + 1, TOTAL_STEPS) })),
    previousStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

    addCategory: (value) =>
      set((state) => ({ categories: [...state.categories, value] })),
    removeCategory: (index) =>
      set((state) => ({
        categories: state.categories.filter((_, i) => i !== index),
      })),
    addSize: (value) => set((state) => ({ sizes: [...state.sizes, value] })),
    removeSize: (index) =>
      set((state) => ({ sizes: state.sizes.filter((_, i) => i !== index) })),
    addColor: (value) => set((state) => ({ colors: [...state.colors, value] })),
    removeColor: (index) =>
      set((state) => ({
        colors: state.colors.filter((_, i) => i !== index),
      })),

    setQuantity: (value) => set({ quantity: Math.max(0, value) }),
    incrementQuantity: () => set((state) => ({ quantity: state.quantity + 1 })),
    decrementQuantity: () =>
      set((state) => ({ quantity: Math.max(0, state.quantity - 1) })),

    setIsActive: (isActive) => set({ isActive }),
    setVisibility: (key, value) =>
      set((state) => ({ visibility: { ...state.visibility, [key]: value } })),

    publish: async () => {
      set({ isLoading: true });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      set({ isLoading: false, isSuccess: true });
    },

    reset: () => set(initialState),
  })
);
