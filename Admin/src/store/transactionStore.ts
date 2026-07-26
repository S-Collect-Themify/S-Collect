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
  isLoading: boolean;

  // Actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: TransactionStatusFilter) => void;
  setMinAmount: (min: string) => void;
  setMaxAmount: (max: string) => void;
  setTempMin: (min: string) => void;
  setTempMax: (max: string) => void;
  setDateRangeKey: (key: string) => void;
  setPage: (page: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  initTempAmount: () => void;
  applyTempAmount: () => void;
  clearAmountFilter: () => void;
  resetFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  search: '',
  statusFilter: 'Captured',
  minAmount: '',
  maxAmount: '',
  tempMin: '',
  tempMax: '',
  dateRangeKey: 'last30Days',
  page: 1,
  isLoading: true,

  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setMinAmount: (minAmount) => set({ minAmount, page: 1 }),
  setMaxAmount: (maxAmount) => set({ maxAmount, page: 1 }),
  setTempMin: (tempMin) => set({ tempMin }),
  setTempMax: (tempMax) => set({ tempMax }),
  setDateRangeKey: (dateRangeKey) => set({ dateRangeKey }),
  setPage: (page) => set({ page }),
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
      statusFilter: 'Captured',
      minAmount: '',
      maxAmount: '',
      tempMin: '',
      tempMax: '',
      dateRangeKey: 'last30Days',
      page: 1,
    }),
}));
