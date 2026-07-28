import { create } from 'zustand';
import type { Vendor, VendorTab, ActiveFilter } from '../types/vendors';

const ITEMS_PER_PAGE = 20;

export type FilterColumn =
  | 'all'
  | 'businessName'
  | 'owner'
  | 'email'
  | 'submittedDate'
  | 'category';

type VendorStore = {
  vendors: Vendor[];
  activeTab: VendorTab;
  search: string;
  filterColumn: FilterColumn;
  selectedCategory: string;
  activeFilter: ActiveFilter;
  page: number;
  selectedRows: string[];
  setActiveTab: (tab: VendorTab) => void;
  setSearch: (search: string) => void;
  setFilterColumn: (col: FilterColumn) => void;
  setSelectedCategory: (category: string) => void;
  setActiveFilter: (filter: ActiveFilter) => void;
  setPage: (page: number) => void;
  approveVendor: (id: string) => void;
  rejectVendor: (id: string, reason?: string) => void;
  suspendVendor: (id: string, reason?: string) => void;
  activateVendor: (id: string) => void;
  bulkApprove: (ids: string[]) => void;
  bulkReject: (ids: string[], reason?: string) => void;
  toggleVendorActive: (id: string) => void;
  toggleRow: (id: string) => void;
  setSelectedRows: (ids: string[]) => void;
  clearSelection: () => void;
};

export const useVendorStore = create<VendorStore>((set) => ({
  vendors: [],
  activeTab: 'pending',
  search: '',
  filterColumn: 'all',
  selectedCategory: '',
  activeFilter: 'all',
  page: 1,
  selectedRows: [],
  setActiveTab: (activeTab) => set({ activeTab, page: 1, selectedRows: [] }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilterColumn: (filterColumn) => set({ filterColumn, search: '', page: 1 }),
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, page: 1 }),
  setActiveFilter: (activeFilter) => set({ activeFilter, page: 1 }),
  setPage: (page) => set({ page }),
  approveVendor: (id) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id
          ? { ...v, status: 'approved', active: true, revenue: v.revenue ?? 0, orders: v.orders ?? 0 }
          : v
      ),
    })),
  rejectVendor: (id, reason) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id ? { ...v, status: 'suspended', suspendReason: reason ?? '' } : v
      ),
    })),
  suspendVendor: (id, reason) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id
          ? { ...v, active: false, suspendReason: reason ?? '' }
          : v
      ),
    })),
  activateVendor: (id) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id ? { ...v, active: true, suspendReason: undefined } : v
      ),
    })),
  bulkApprove: (ids) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        ids.includes(v.id)
          ? { ...v, status: 'approved', active: true, revenue: v.revenue ?? 0, orders: v.orders ?? 0 }
          : v
      ),
      selectedRows: [],
    })),
  bulkReject: (ids, reason) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        ids.includes(v.id) ? { ...v, status: 'suspended', suspendReason: reason ?? '' } : v
      ),
      selectedRows: [],
    })),
  toggleVendorActive: (id) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id ? { ...v, active: !v.active } : v
      ),
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

export function useVendorTable(fetchedVendors?: Vendor[]) {
  const storeVendors = useVendorStore((s) => s.vendors);
  const vendors = fetchedVendors ?? storeVendors;

  const activeTab = useVendorStore((s) => s.activeTab);
  const search = useVendorStore((s) => s.search);
  const filterColumn = useVendorStore((s) => s.filterColumn);
  const selectedCategory = useVendorStore((s) => s.selectedCategory);
  const activeFilter = useVendorStore((s) => s.activeFilter);
  const page = useVendorStore((s) => s.page);
  const selectedRows = useVendorStore((s) => s.selectedRows);

  const pendingCount = vendors.filter((v) => v.status === 'pending').length;

  // Filtering
  const tabFiltered = vendors.filter((v) => {
    if (activeTab === 'pending') return v.status === 'pending';
    if (activeTab === 'suspended') return v.status === 'suspended';
    return v.status === 'approved' || v.status === 'pending' || v.status === 'suspended'; // Show items returned from query
  });

  const filtered = tabFiltered.filter((v) => {
    // Active filter (only for "all" tab)
    if (activeTab === 'all' && activeFilter === 'active' && !v.active) return false;
    if (activeTab === 'all' && activeFilter === 'inactive' && v.active) return false;

    if (search) {
      const q = search.toLowerCase();
      const match =
        filterColumn === 'all'
          ? v.businessName.toLowerCase().includes(q) ||
            v.owner.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            v.submittedDate.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q)
          : filterColumn === 'businessName'
            ? v.businessName.toLowerCase().includes(q)
            : filterColumn === 'owner'
              ? v.owner.toLowerCase().includes(q)
              : filterColumn === 'email'
                ? v.email.toLowerCase().includes(q)
                : filterColumn === 'submittedDate'
                  ? v.submittedDate.toLowerCase().includes(q)
                  : v.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory && v.category !== selectedCategory) return false;
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const paginatedIds = paginated.map((v) => v.id);
  const allChecked =
    paginated.length > 0 &&
    paginatedIds.every((id) => selectedRows.includes(id));
  const selectedCount = selectedRows.length;

  return {
    paginated,
    totalItems,
    totalPages,
    page: safePage,
    itemsPerPage: ITEMS_PER_PAGE,
    pendingCount,
    selectedRows,
    selectedCount,
    allChecked,
    paginatedIds,
  };
}
