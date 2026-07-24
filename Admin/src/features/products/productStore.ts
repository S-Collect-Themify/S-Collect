import { create } from 'zustand';
import { INITIAL_PRODUCTS } from './data';
import type { ProductItem, StatusFilter, DisableModalState } from './types';

interface ProductStore {
  products: ProductItem[];
  search: string;
  vendorFilter: string;
  categoryFilter: string;
  statusFilter: StatusFilter;
  currentPage: number;
  modal: DisableModalState;
  
  setProducts: (products: ProductItem[]) => void;
  setSearch: (search: string) => void;
  setVendorFilter: (vendor: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setCurrentPage: (page: number) => void;
  
  openDisableModal: (product: ProductItem) => void;
  closeDisableModal: () => void;
  toggleProductStatus: (productId: string | number, nextStatus?: boolean) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: INITIAL_PRODUCTS,
  search: '',
  vendorFilter: 'all',
  categoryFilter: 'all',
  statusFilter: 'all',
  currentPage: 1,
  modal: {
    open: false,
    product: null,
    targetStatus: false,
  },

  setProducts: (products) => set({ products }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setVendorFilter: (vendorFilter) => set({ vendorFilter, currentPage: 1 }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  openDisableModal: (product) =>
    set({
      modal: {
        open: true,
        product,
        targetStatus: false,
      },
    }),

  closeDisableModal: () =>
    set({
      modal: {
        open: false,
        product: null,
        targetStatus: false,
      },
    }),

  toggleProductStatus: (productId, nextStatus) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, isActive: nextStatus !== undefined ? nextStatus : !p.isActive }
          : p
      ),
    })),
}));
