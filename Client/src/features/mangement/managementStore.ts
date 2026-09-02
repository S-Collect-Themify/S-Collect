import { create } from 'zustand';
import type { StatusFilter } from './mangement';

type ManagementStore = {
  selectedCategories: string[];
  selectedStatus: StatusFilter;
  search: string;
  page: number;
  selectedRows: (string | number)[];
  isBulkDiscountModalOpen: boolean;
  setSearch: (search: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedStatus: (status: StatusFilter) => void;
  setPage: (page: number) => void;
  toggleRow: (id: string | number) => void;
  toggleSelectPage: (pageProductIds: (string | number)[]) => void;
  setSelectedRows: (ids: (string | number)[]) => void;
  clearSelection: () => void;
  openBulkDiscountModal: () => void;
  closeBulkDiscountModal: () => void;
};

export const useManagementStore = create<ManagementStore>((set) => ({
  selectedCategories: [],
  selectedStatus: 'All',
  search: '',
  page: 1,
  selectedRows: [],
  isBulkDiscountModalOpen: false,
  setSearch: (search) => set({ search, page: 1 }),
  setSelectedCategories: (selectedCategories) =>
    set({ selectedCategories, page: 1 }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, page: 1 }),
  setPage: (page) => set({ page }),
  toggleRow: (id) =>
    set((state) => {
      const idStr = String(id);
      const exists = state.selectedRows.some((rowId) => String(rowId) === idStr);
      return {
        selectedRows: exists
          ? state.selectedRows.filter((rowId) => String(rowId) !== idStr)
          : [...state.selectedRows, id],
      };
    }),
  toggleSelectPage: (pageProductIds) =>
    set((state) => {
      const pageIdStrs = pageProductIds.map(String);
      const isAllSelected =
        pageIdStrs.length > 0 &&
        pageIdStrs.every((pid) =>
          state.selectedRows.some((rowId) => String(rowId) === pid)
        );

      if (isAllSelected) {
        const pageIdSet = new Set(pageIdStrs);
        return {
          selectedRows: state.selectedRows.filter(
            (rowId) => !pageIdSet.has(String(rowId))
          ),
        };
      } else {
        const existingStrSet = new Set(state.selectedRows.map(String));
        const newIdsToAdd = pageProductIds.filter(
          (pid) => !existingStrSet.has(String(pid))
        );
        return {
          selectedRows: [...state.selectedRows, ...newIdsToAdd],
        };
      }
    }),
  setSelectedRows: (selectedRows) => {
    const seen = new Set<string>();
    const unique = selectedRows.filter((id) => {
      const s = String(id);
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
    return set({ selectedRows: unique });
  },
  clearSelection: () => set({ selectedRows: [] }),
  openBulkDiscountModal: () => set({ isBulkDiscountModalOpen: true }),
  closeBulkDiscountModal: () => set({ isBulkDiscountModalOpen: false }),
}));

// Re-export hooks for convenience
export { useManagementTable, useManagementActions } from './useManagementHooks';
