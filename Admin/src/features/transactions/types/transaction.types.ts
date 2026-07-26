export type TransactionStatus = 'Captured' | 'Pending' | 'Failed' | 'Refunded';
export type TransactionStatusFilter = 'All' | TransactionStatus;

export interface TransactionItem {
  id: string;
  orderNo: string;
  date: string;
  buyerName: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  fatoorahRef: string;
}

export interface ExportHeader {
  key: keyof TransactionItem;
  label: string;
}

export type DateRangeKey = 'last7Days' | 'last30Days' | 'thisMonth' | 'thisYear';
