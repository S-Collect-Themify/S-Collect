import { create } from 'zustand';
import type { TransactionStatusFilter } from '../features/transactions/types/transaction.types';
import { getAdminOrders, type AdminOrderItem } from '../services/orders';

interface TransactionState {
  search: string;
  statusFilter: TransactionStatusFilter;
  minAmount: string;
  maxAmount: string;
  tempMin: string;
  tempMax: string;
  dateRangeKey: string;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  rawOrders: AdminOrderItem[];

  // Actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: TransactionStatusFilter) => void;
  setMinAmount: (min: string) => void;
  setMaxAmount: (max: string) => void;
  setTempMin: (min: string) => void;
  setTempMax: (max: string) => void;
  setDateRangeKey: (key: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  initTempAmount: () => void;
  applyTempAmount: () => void;
  clearAmountFilter: () => void;
  resetFilters: () => void;
  fetchOrders: (overridePage?: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  search: '',
  statusFilter: 'ALL',
  minAmount: '',
  maxAmount: '',
  tempMin: '',
  tempMax: '',
  dateRangeKey: 'all',
  page: 1,
  pageSize: 25,
  totalItems: 0,
  totalPages: 1,
  isLoading: false,
  error: null,
  rawOrders: [],

  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setMinAmount: (minAmount) => set({ minAmount, page: 1 }),
  setMaxAmount: (maxAmount) => set({ maxAmount, page: 1 }),
  setTempMin: (tempMin) => set({ tempMin }),
  setTempMax: (tempMax) => set({ tempMax }),
  setDateRangeKey: (dateRangeKey) => set({ dateRangeKey }),
  setPage: (page) => {
    set({ page });
    get().fetchOrders(page);
  },
  setPageSize: (pageSize) => {
    set({ pageSize, page: 1 });
    get().fetchOrders(1);
  },
  setIsLoading: (isLoading) => set({ isLoading }),

  initTempAmount: () =>
    set((state) => ({
      tempMin: state.minAmount,
      tempMax: state.maxAmount,
    })),

  applyTempAmount: () =>
    set((state) => ({
      minAmount: state.tempMin,
      maxAmount: state.tempMax,
      page: 1,
    })),

  clearAmountFilter: () =>
    set({
      tempMin: '',
      tempMax: '',
      minAmount: '',
      maxAmount: '',
      page: 1,
    }),

  resetFilters: () =>
    set({
      search: '',
      statusFilter: 'ALL',
      minAmount: '',
      maxAmount: '',
      tempMin: '',
      tempMax: '',
      dateRangeKey: 'all',
      page: 1,
    }),

  fetchOrders: async (overridePage?: number) => {
    const currentState = get();
    const targetPage = overridePage ?? currentState.page;
    set({ isLoading: true, error: null });

    try {
      const data = await getAdminOrders({
        pageNum: targetPage,
        pageSize: currentState.pageSize,
      });

      set({
        rawOrders: data.items || [],
        totalItems: data.pagination?.totalItems ?? (data.items?.length || 0),
        totalPages: data.pagination?.totalPages ?? 1,
        page: data.pagination?.currentPage && data.pagination.currentPage > 0 ? data.pagination.currentPage : targetPage,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch admin orders:', err);
      set({
        error: err?.message || 'Failed to load transactions',
        rawOrders: [],
        isLoading: false,
      });
    }
  },
}));
