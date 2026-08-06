import { create } from 'zustand';
import { ITEMS_PER_PAGE_DEFAULT } from '../data/constant';
import type { Buyer, BuyerStatus } from '../types/buyers';

type BuyerStore = {
  buyers: Buyer[];
  search: string;
  statusFilter: string;
  page: number;
  pageSize: number;
  selectedRows: string[];
  setBuyers: (buyers: Buyer[]) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (filter: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  suspendBuyer: (id: string, reason?: string) => void;
  activateBuyer: (id: string) => void;
  bulkActivate: (ids: string[]) => void;
  bulkSuspend: (ids: string[], reason?: string) => void;
  toggleRow: (id: string) => void;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
};

export const useBuyerStore = create<BuyerStore>((set) => ({
  buyers: [],
  search: '',
  statusFilter: 'all',
  page: 1,
  pageSize: ITEMS_PER_PAGE_DEFAULT,
  selectedRows: [],
  setBuyers: (buyers) => set({ buyers }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1, selectedRows: [] }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  suspendBuyer: (id, reason) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        b.id === id ? { ...b, status: 'LOCKED' as BuyerStatus, suspendReason: reason } : b
      ),
    })),
  activateBuyer: (id) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        b.id === id ? { ...b, status: 'ACTIVE' as BuyerStatus } : b
      ),
    })),
  bulkActivate: (ids) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        ids.includes(b.id) ? { ...b, status: 'ACTIVE' as BuyerStatus } : b
      ),
      selectedRows: [],
    })),
  bulkSuspend: (ids, reason) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        ids.includes(b.id) ? { ...b, status: 'LOCKED' as BuyerStatus, suspendReason: reason } : b
      ),
      selectedRows: [],
    })),
  toggleRow: (id) =>
    set((state) => ({
      selectedRows: state.selectedRows.includes(id)
        ? state.selectedRows.filter((r) => r !== id)
        : [...state.selectedRows, id],
    })),
  setSelectedRows: (selectedRows) => set({ selectedRows }),
  clearSelection: () => set({ selectedRows: [] }),
}));
