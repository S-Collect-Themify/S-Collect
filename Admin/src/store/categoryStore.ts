import { create } from 'zustand';
import type { Category, CategoryDepth } from '../features/categories/types';

interface FormModalState {
  open: boolean;
  mode: 'add' | 'edit';
  category: Category | null;
  // Depth of the node being added/edited — 1 = Category, 2 = Sub-Category.
  // Departments (depth 0) are seeded by the backend and never created here.
  level: 1 | 2;
  // Parent department id (when level 1) or parent category id (when level 2).
  parentId: string | null;
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
  departmentFilter: string;
  selectedIds: Set<string>;
  expandedIds: Set<string>;

  formModal: FormModalState;
  deleteModal: DeleteModalState;
  statusModal: StatusModalState;
  cannotDeleteModal: CannotDeleteModalState;
  discountModal: { open: boolean };

  // Actions
  setSearch: (val: string) => void;
  setDepartmentFilter: (val: string) => void;
  handleSelectOne: (id: string) => void;
  handleSelectAll: (pageIds: string[]) => void;
  clearSelection: () => void;
  toggleExpanded: (id: string) => void;
  setExpandedIds: (ids: Set<string>) => void;
  expandIds: (ids: string[]) => void;

  openAdd: (opts?: { level?: 1 | 2; parentId?: string | null }) => void;
  openEdit: (category: Category) => void;
  openDelete: (category: Category) => void;
  openBulkDelete: () => void;
  closeForm: () => void;
  closeDelete: () => void;
  closeStatusModal: () => void;
  closeCannotDeleteModal: () => void;
  openCannotDeleteModal: (payload: { isBulk: boolean; categoryName?: string; productsCount?: number }) => void;
  openDiscountModal: () => void;
  closeDiscountModal: () => void;
  handleToggleActiveRequest: (category: Category) => void;
}

const parentLevelOf = (depth: CategoryDepth): 1 | 2 => (depth === 2 ? 2 : 1);

export const useCategoryStore = create<CategoryStore>((set) => ({
  search: '',
  departmentFilter: 'all',
  selectedIds: new Set<string>(),
  expandedIds: new Set<string>(),

  formModal: { open: false, mode: 'add', category: null, level: 1, parentId: null },
  deleteModal: { open: false, category: null, isBulk: false },
  statusModal: { open: false, category: null },
  cannotDeleteModal: { open: false, isBulk: false },
  discountModal: { open: false },

  setSearch: (val) => set({ search: val }),
  setDepartmentFilter: (val) => set({ departmentFilter: val }),

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

  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    }),
  setExpandedIds: (ids) => set({ expandedIds: ids }),
  expandIds: (ids) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      ids.forEach((id) => next.add(id));
      return { expandedIds: next };
    }),

  openAdd: (opts) =>
    set({
      formModal: {
        open: true,
        mode: 'add',
        category: null,
        level: opts?.level ?? 1,
        parentId: opts?.parentId ?? null,
      },
    }),
  openEdit: (category) =>
    set({
      formModal: {
        open: true,
        mode: 'edit',
        category,
        level: parentLevelOf(category.depth),
        parentId: category.parentCategoryId ?? null,
      },
    }),
  openDelete: (category) => set({ deleteModal: { open: true, category, isBulk: false } }),
  openBulkDelete: () => set({ deleteModal: { open: true, category: null, isBulk: true } }),
  closeForm: () => set((state) => ({ formModal: { ...state.formModal, open: false } })),
  closeDelete: () => set({ deleteModal: { open: false, category: null, isBulk: false } }),
  closeStatusModal: () => set({ statusModal: { open: false, category: null } }),
  closeCannotDeleteModal: () => set({ cannotDeleteModal: { open: false, isBulk: false } }),
  openCannotDeleteModal: (payload) => set({ cannotDeleteModal: { open: true, ...payload } }),
  openDiscountModal: () => set({ discountModal: { open: true } }),
  closeDiscountModal: () => set({ discountModal: { open: false } }),
  handleToggleActiveRequest: (category) => set({ statusModal: { open: true, category } }),
}));
