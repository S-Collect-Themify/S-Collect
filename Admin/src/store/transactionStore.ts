import { create } from 'zustand';
import type { TransactionStatusFilter } from '../features/transactions/types/transaction.types';

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
  initTempAmount: () => void;
  applyTempAmount: () => void;
  clearAmountFilter: () => void;
  resetFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  search: '',
  statusFilter: 'ALL',
  minAmount: '',
  maxAmount: '',
  tempMin: '',
  tempMax: '',
  dateRangeKey: 'all',
  page: 1,
  pageSize: 20,

  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setMinAmount: (minAmount) => set({ minAmount, page: 1 }),
  setMaxAmount: (maxAmount) => set({ maxAmount, page: 1 }),
  setTempMin: (tempMin) => set({ tempMin }),
  setTempMax: (tempMax) => set({ tempMax }),
  setDateRangeKey: (dateRangeKey) => set({ dateRangeKey, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

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
}));
