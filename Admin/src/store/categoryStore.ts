import { create } from 'zustand';
import type { Category } from '../features/categories/types';

interface FormModalState {
  open: boolean;
  mode: 'add' | 'edit';
  category: Category | null;
}

interface DeleteModalState {
  open: boolean;
  category: Category | null;
  isBulk: boolean;
}

interface StatusModalState {
  open: boolean;
  category: Category | null;
}

interface CannotDeleteModalState {
  open: boolean;
  isBulk: boolean;
  categoryName?: string;
  productsCount?: number;
}

interface CategoryStore {
  search: string;
  categoryFilter: string;
  currentPage: number;
  selectedIds: Set<string>;

  formModal: FormModalState;
  deleteModal: DeleteModalState;
  statusModal: StatusModalState;
  cannotDeleteModal: CannotDeleteModalState;

  // Actions
  setSearch: (val: string) => void;
  setCategoryFilter: (val: string) => void;
  setCurrentPage: (page: number) => void;
  handleSelectOne: (id: string) => void;
  handleSelectAll: (pageIds: string[]) => void;
  clearSelection: () => void;

  openAdd: () => void;
  openEdit: (category: Category) => void;
  openDelete: (category: Category) => void;
  openBulkDelete: () => void;
  closeForm: () => void;
  closeDelete: () => void;
  closeStatusModal: () => void;
  closeCannotDeleteModal: () => void;
  openCannotDeleteModal: (payload: { isBulk: boolean; categoryName?: string; productsCount?: number }) => void;
  handleToggleActiveRequest: (category: Category) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  search: '',
  categoryFilter: 'all',
  currentPage: 1,
  selectedIds: new Set<string>(),

  formModal: { open: false, mode: 'add', category: null },
  deleteModal: { open: false, category: null, isBulk: false },
  statusModal: { open: false, category: null },
  cannotDeleteModal: { open: false, isBulk: false },

  setSearch: (val) => set({ search: val, currentPage: 1 }),
  setCategoryFilter: (val) => set({ categoryFilter: val, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  handleSelectOne: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  handleSelectAll: (pageIds) =>
    set((state) => {
      const allSelected = pageIds.every((id) => state.selectedIds.has(id));
      const next = new Set(state.selectedIds);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return { selectedIds: next };
    }),

  clearSelection: () => set({ selectedIds: new Set() }),

  openAdd: () => set({ formModal: { open: true, mode: 'add', category: null } }),
  openEdit: (category) => set({ formModal: { open: true, mode: 'edit', category } }),
  openDelete: (category) => set({ deleteModal: { open: true, category, isBulk: false } }),
  openBulkDelete: () => set({ deleteModal: { open: true, category: null, isBulk: true } }),
  closeForm: () => set((state) => ({ formModal: { ...state.formModal, open: false } })),
  closeDelete: () => set({ deleteModal: { open: false, category: null, isBulk: false } }),
  closeStatusModal: () => set({ statusModal: { open: false, category: null } }),
  closeCannotDeleteModal: () => set({ cannotDeleteModal: { open: false, isBulk: false } }),
  openCannotDeleteModal: (payload) => set({ cannotDeleteModal: { open: true, ...payload } }),
  handleToggleActiveRequest: (category) => set({ statusModal: { open: true, category } }),
}));
