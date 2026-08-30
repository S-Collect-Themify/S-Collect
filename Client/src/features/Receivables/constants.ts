import type { VendorPayoutItem } from '../../services/payouts';

export type TransactionStatus =
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
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PAID: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  adjusted: 'bg-purple-50 text-purple-700 border border-purple-200',
  ADJUSTED: 'bg-purple-50 text-purple-700 border border-purple-200',
  failed: 'bg-rose-50 text-rose-700 border border-rose-200',
  FAILED: 'bg-rose-50 text-rose-700 border border-rose-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
  cancelled: 'bg-gray-100 text-gray-700 border border-gray-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export const STATUS_FILTERS = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'FAILED',
  'CANCELLED',
] as const;

export const ITEMS_PER_PAGE = 25;
