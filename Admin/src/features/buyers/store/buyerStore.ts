import { create } from 'zustand';
import { INITIAL_BUYERS, ITEMS_PER_PAGE_DEFAULT } from '../data/constant';
import type { Buyer, BuyerStatus } from '../types/buyers';

type BuyerStore = {
  buyers: Buyer[];
  search: string;
  statusFilter: BuyerStatus | 'all';
  page: number;
  selectedRows: number[];
  setSearch: (search: string) => void;
  setStatusFilter: (filter: BuyerStatus | 'all') => void;
  setPage: (page: number) => void;
  suspendBuyer: (id: number, reason?: string) => void;
  activateBuyer: (id: number) => void;
  bulkActivate: (ids: number[]) => void;
  bulkSuspend: (ids: number[], reason?: string) => void;
  toggleRow: (id: number) => void;
  setSelectedRows: (ids: number[]) => void;
  clearSelection: () => void;
};

export const useBuyerStore = create<BuyerStore>((set) => ({
  buyers: INITIAL_BUYERS,
  search: '',
  statusFilter: 'all',
  page: 1,
  selectedRows: [],
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1, selectedRows: [] }),
  setPage: (page) => set({ page }),
  suspendBuyer: (id, reason) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        b.id === id ? { ...b, status: 'suspended' as BuyerStatus, suspendReason: reason } : b
      ),
    })),
  activateBuyer: (id) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        b.id === id ? { ...b, status: 'active' as BuyerStatus } : b
      ),
    })),
  bulkActivate: (ids) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        ids.includes(b.id) ? { ...b, status: 'active' as BuyerStatus } : b
      ),
      selectedRows: [],
    })),
  bulkSuspend: (ids, reason) =>
    set((state) => ({
      buyers: state.buyers.map((b) =>
        ids.includes(b.id) ? { ...b, status: 'suspended' as BuyerStatus, suspendReason: reason } : b
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

export function useBuyerTable() {
  const buyers = useBuyerStore((s) => s.buyers);
  const search = useBuyerStore((s) => s.search);
  const statusFilter = useBuyerStore((s) => s.statusFilter);
  const page = useBuyerStore((s) => s.page);
  const selectedRows = useBuyerStore((s) => s.selectedRows);

  const filtered = buyers.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE_DEFAULT));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE_DEFAULT;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE_DEFAULT);

  const paginatedIds = paginated.map((b) => b.id);
  const allChecked =
    paginated.length > 0 && paginatedIds.every((id) => selectedRows.includes(id));
  const selectedCount = selectedRows.length;

  return {
    paginated,
    totalItems,
    totalPages,
    page: safePage,
    itemsPerPage: ITEMS_PER_PAGE_DEFAULT,
    selectedRows,
    selectedCount,
    allChecked,
    paginatedIds,
  };
}
