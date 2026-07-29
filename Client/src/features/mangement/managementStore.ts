import { create } from 'zustand';
import type { StatusFilter } from './mangement';

type ManagementStore = {
  selectedCategories: string[];
  selectedStatus: StatusFilter;
  search: string;
  page: number;
  selectedRows: (string | number)[];
  setSearch: (search: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedStatus: (status: StatusFilter) => void;
  setPage: (page: number) => void;
  toggleRow: (id: string | number) => void;
  setSelectedRows: (ids: (string | number)[]) => void;
  clearSelection: () => void;
};

export const useManagementStore = create<ManagementStore>((set) => ({
  selectedCategories: [],
  selectedStatus: 'All',
  search: '',
  page: 1,
  selectedRows: [],
  setSearch: (search) => set({ search, page: 1 }),
  setSelectedCategories: (selectedCategories) =>
    set({ selectedCategories, page: 1 }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, page: 1 }),
  setPage: (page) => set({ page }),
  toggleRow: (id) =>
    set((state) => ({
      selectedRows: state.selectedRows.includes(id)
        ? state.selectedRows.filter((rowId) => rowId !== id)
        : [...state.selectedRows, id],
    })),
  setSelectedRows: (selectedRows) => set({ selectedRows }),
  clearSelection: () => set({ selectedRows: [] }),
}));

// Re-export hooks for convenience
export { useManagementTable, useManagementActions } from './useManagementHooks';
