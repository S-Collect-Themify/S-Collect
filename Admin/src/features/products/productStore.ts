import { create } from 'zustand';
import type { ProductItem, StatusFilter, DisableModalState } from './types';

interface ProductStore {
  products: ProductItem[];
  search: string;
  vendorFilter: string;
  categoryFilter: string;
  statusFilter: StatusFilter;
  currentPage: number;
  modal: DisableModalState;
  selectedProductIds: (string | number)[];
  isBulkDiscountModalOpen: boolean;
  
  setProducts: (products: ProductItem[]) => void;
  setSearch: (search: string) => void;
  setVendorFilter: (vendor: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setCurrentPage: (page: number) => void;
  
  openDisableModal: (product: ProductItem) => void;
  closeDisableModal: () => void;
  toggleProductStatus: (productId: string | number, nextStatus?: boolean) => void;

  toggleSelectProduct: (productId: string | number) => void;
  selectAllProducts: (productIds: (string | number)[]) => void;
  clearSelectedProducts: () => void;

  openBulkDiscountModal: () => void;
  closeBulkDiscountModal: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
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
  selectedProductIds: [],
  isBulkDiscountModalOpen: false,

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

  toggleSelectProduct: (productId) =>
    set((state) => {
      const exists = state.selectedProductIds.includes(productId);
      return {
        selectedProductIds: exists
          ? state.selectedProductIds.filter((id) => id !== productId)
          : [...state.selectedProductIds, productId],
      };
    }),

  selectAllProducts: (productIds) =>
    set((state) => {
      const allSelected = productIds.every((id) => state.selectedProductIds.includes(id));
      if (allSelected) {
        return {
          selectedProductIds: state.selectedProductIds.filter((id) => !productIds.includes(id)),
        };
      } else {
        const merged = new Set([...state.selectedProductIds, ...productIds]);
        return { selectedProductIds: Array.from(merged) };
      }
    }),

  clearSelectedProducts: () => set({ selectedProductIds: [] }),
  openBulkDiscountModal: () => set({ isBulkDiscountModalOpen: true }),
  closeBulkDiscountModal: () => set({ isBulkDiscountModalOpen: false }),
}));
