import { create } from 'zustand';
import { INITIAL_VOUCHERS } from './data';
import type { VoucherItem, VoucherTab, DeleteVoucherModalState } from './types';

interface VoucherStore {
  vouchers: VoucherItem[];
  activeTab: VoucherTab;
  search: string;
  typeFilter: string;
  statusFilter: string;
  currentPage: number;
  deleteModal: DeleteVoucherModalState;

  setVouchers: (vouchers: VoucherItem[]) => void;
  setActiveTab: (tab: VoucherTab) => void;
  setSearch: (search: string) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
  setCurrentPage: (page: number) => void;

  openDeleteModal: (voucher: VoucherItem) => void;
  closeDeleteModal: () => void;
  addVoucher: (voucher: VoucherItem) => void;
  updateVoucher: (id: string, updated: Partial<VoucherItem>) => void;
  removeVoucher: (id: string) => void;
}

export const useVoucherStore = create<VoucherStore>((set) => ({
  vouchers: INITIAL_VOUCHERS,
  activeTab: 'all',
  search: '',
  typeFilter: 'all',
  statusFilter: 'all',
  currentPage: 1,
  deleteModal: {
    open: false,
    voucher: null,
  },

  setVouchers: (vouchers) => set({ vouchers }),
  setActiveTab: (activeTab) => set({ activeTab, currentPage: 1 }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setTypeFilter: (typeFilter) => set({ typeFilter, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  openDeleteModal: (voucher) =>
    set({
      deleteModal: {
        open: true,
        voucher,
      },
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: {
        open: false,
        voucher: null,
      },
    }),

  addVoucher: (voucher) =>
    set((state) => ({
      vouchers: [voucher, ...state.vouchers],
    })),

  updateVoucher: (id, updated) =>
    set((state) => ({
      vouchers: state.vouchers.map((v) =>
        v.id === id || v.code === id ? { ...v, ...updated } : v
      ),
    })),

  removeVoucher: (id) =>
    set((state) => ({
      vouchers: state.vouchers.filter((v) => v.id !== id && v.code !== id),
      deleteModal: { open: false, voucher: null },
    })),
}));
