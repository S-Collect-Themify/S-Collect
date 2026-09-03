import type { VendorPayoutItem } from '../../services/payouts';

export type TransactionStatus =
  | 'completed'
  | 'COMPLETED'
  | 'paid'
  | 'PAID'
  | 'processing'
  | 'PROCESSING'
  | 'pending'
  | 'PENDING'
  | 'adjusted'
  | 'ADJUSTED'
  | 'failed'
  | 'FAILED'
  | 'rejected'
  | 'REJECTED'
  | 'cancelled'
  | 'CANCELLED'
  | string;

export interface Transaction {
  id: string;
  date: string;
  referenceNumber: string;
  status: string;
  amount: number;
  isAdjustment: boolean;
  referenceNote?: string | Record<string, unknown> | null;
  transferDate?: string | null;
  clarifyingNote?: string | Record<string, unknown> | null;
  rawItem?: VendorPayoutItem;
}

export const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-[#E8F8EE] text-[#16A34A]',
  COMPLETED: 'bg-[#E8F8EE] text-[#16A34A]',
  paid: 'bg-[#E8F8EE] text-[#16A34A]',
  PAID: 'bg-[#E8F8EE] text-[#16A34A]',
  processing: 'bg-[#FEF6E7] text-[#B45309]',
  PROCESSING: 'bg-[#FEF6E7] text-[#B45309]',
  adjusted: 'bg-[#FEECEC] text-[#DC2626]',
  ADJUSTED: 'bg-[#FEECEC] text-[#DC2626]',
  pending: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-amber-50 text-amber-700',
  failed: 'bg-rose-50 text-rose-600',
  FAILED: 'bg-rose-50 text-rose-600',
  rejected: 'bg-rose-50 text-rose-600',
  REJECTED: 'bg-rose-50 text-rose-600',
  cancelled: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export const STATUS_FILTERS = [
  'PENDING',
  'COMPLETED',
  'PROCESSING',
  'FAILED',
  'CANCELLED',
] as const;

export const ITEMS_PER_PAGE = 6;
