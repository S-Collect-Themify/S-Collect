export interface TableItem {
  id: string;
  code: string;
  customer: string;
  vendor?: string;
  orderId?: string;
  total: number;
  totalFormatted: string;
  status: string;
  subOrdersCount?: number;
  reason?: string;
  date: string;
}

export type OrderMainTab = 'allOrders' | 'refunds';
