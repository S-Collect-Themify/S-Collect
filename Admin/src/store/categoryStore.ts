import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import type { Category } from '../features/categories/types';
import { INITIAL_CATEGORIES } from '../features/categories/data';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deactivateAdminCategory,
  reactivateAdminCategory,
} from '../services/categories';

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
  categories: Category[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  search: string;
  categoryFilter: string;
  currentPage: number;
  selectedIds: Set<string>;

  formModal: FormModalState;
  deleteModal: DeleteModalState;
  statusModal: StatusModalState;
  cannotDeleteModal: CannotDeleteModalState;

  // Actions
  fetchCategories: () => Promise<void>;
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

  handleSave: (data: Omit<Category, 'id' | 'productsCount'>) => Promise<void>;
  handleDelete: (lang: string) => void;
  handleToggleActiveRequest: (category: Category) => void;
  handleStatusConfirm: () => void;
  reorderCategories: (oldIndex: number, newIndex: number) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: INITIAL_CATEGORIES,
  isLoading: false,
  isSubmitting: false,
  error: null,
  search: '',
  categoryFilter: 'all',
  currentPage: 1,
  selectedIds: new Set<string>(),

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawList = await getAdminCategories();
      const formattedList: Category[] = rawList.map((item) => ({
        id: String(item.id),
        name: item.name,
        nameEn: item.nameEn || item.name || '',
        nameAr: item.nameAr || item.name || '',
        slug: item.slug || '',
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        productsCount: item.productsCount ?? 0,
        createdAt: item.createdAt,
      }));
      set({ categories: formattedList, isLoading: false, error: null });
    } catch (err: any) {
      console.error('Failed to fetch admin categories:', err);
      set({
        error: err?.response?.data?.message || err?.message || 'Failed to fetch categories',
        isLoading: false,
      });
    }
  },

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
  closeForm: () =>
    set((state) => ({ formModal: { ...state.formModal, open: false } })),
  closeDelete: () => set({ deleteModal: { open: false, category: null, isBulk: false } }),
  closeStatusModal: () => set({ statusModal: { open: false, category: null } }),
  closeCannotDeleteModal: () => set({ cannotDeleteModal: { open: false, isBulk: false } }),

  handleSave: async (data) => {
    const { formModal, closeForm, fetchCategories } = get();
    if (formModal.mode === 'add') {
      set({ isSubmitting: true });
      try {
        await createAdminCategory({
          name: data.nameEn || data.name || '',
          nameAr: data.nameAr || '',
          slug: data.slug,
        });
        toast.success('Category created successfully');
        closeForm();
        await fetchCategories();
      } catch (err: any) {
        console.error('Failed to create category:', err);
        toast.error(err?.response?.data?.message || err?.message || 'Failed to create category');
      } finally {
        set({ isSubmitting: false });
      }
    } else if (formModal.category) {
      const targetId = formModal.category.id;
      set({ isSubmitting: true });
      try {
        await updateAdminCategory(targetId, {
          name: data.nameEn || data.name || '',
          nameAr: data.nameAr || '',
          slug: data.slug,
          isActive: data.isActive,
        });
        toast.success('Category updated successfully');
        closeForm();
        await fetchCategories();
      } catch (err: any) {
        console.error('Failed to update category:', err);
        toast.error(err?.response?.data?.message || err?.message || 'Failed to update category');
      } finally {
        set({ isSubmitting: false });
      }
    }
  },


  handleDelete: (lang) => {
    const { deleteModal, categories, selectedIds, closeDelete, clearSelection } = get();

    if (deleteModal.isBulk) {
      const selectedCats = categories.filter((c) => selectedIds.has(c.id));
      const hasProducts = selectedCats.some((c) => c.productsCount > 0);
      if (hasProducts) {
        closeDelete();
        set({ cannotDeleteModal: { open: true, isBulk: true } });
        return;
      }
      set((state) => ({
        categories: state.categories.filter((c) => !state.selectedIds.has(c.id)),
      }));
      clearSelection();
    } else if (deleteModal.category) {
      const cat = deleteModal.category;
      if (cat.productsCount > 0) {
        closeDelete();
        set({
          cannotDeleteModal: {
            open: true,
            isBulk: false,
            categoryName: lang === 'ar' ? cat.nameAr : cat.nameEn,
            productsCount: cat.productsCount,
          },
        });
        return;
      }
      set((state) => {
        const nextSelected = new Set(state.selectedIds);
        nextSelected.delete(cat.id);
        return {
          categories: state.categories.filter((c) => c.id !== cat.id),
          selectedIds: nextSelected,
        };
      });
    }
    closeDelete();
  },

  handleToggleActiveRequest: (cat) => {
    set({ statusModal: { open: true, category: cat } });
  },

  handleStatusConfirm: async () => {
    const { statusModal, closeStatusModal, fetchCategories } = get();
    if (statusModal.category) {
      const targetId = statusModal.category.id;
      const isCurrentlyActive = statusModal.category.isActive;
      try {
        if (isCurrentlyActive) {
          await deactivateAdminCategory(targetId);
          toast.success('Category deactivated successfully');
        } else {
          await reactivateAdminCategory(targetId);
          toast.success('Category reactivated successfully');
        }
        closeStatusModal();
        await fetchCategories();
      } catch (err: any) {
        console.error('Failed to update category status:', err);
        toast.error(err?.response?.data?.message || err?.message || 'Failed to update status');
        closeStatusModal();
      }
    }
  },

  reorderCategories: (oldIndex, newIndex) => {
    set((state) => ({
      categories: arrayMove(state.categories, oldIndex, newIndex),
    }));
  },
}));
