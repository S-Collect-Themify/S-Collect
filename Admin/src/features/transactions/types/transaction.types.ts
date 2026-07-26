export type TransactionStatus = string;
export type TransactionStatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | string;

export interface TransactionItem {
  id: string;
  orderNo: string;
  date: string;
  buyerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  fatoorahRef: string;
  rawPaymentStatus?: string;
}

export interface ExportHeader {
  key: keyof TransactionItem;
  label: string;
}

export type DateRangeKey = 'all' | 'last7Days' | 'last30Days' | 'thisMonth' | 'thisYear';
