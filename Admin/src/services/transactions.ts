import { api } from './api';
import type { TransactionItem } from '../features/transactions/types/transaction.types';

export interface GetAdminTransactionsParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  orderId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface BackendTransactionItem {
  id: string;
  orderId?: string | null;
  orderNumber?: string | Record<string, unknown> | null;
  buyerName?: string | Record<string, unknown> | null;
  amount?: number | null;
  paymentMethod?: string | null;
  status?: string | null;
  gatewayReference?: string | Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BackendTransactionsPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface GetAdminTransactionsResponse {
  items: BackendTransactionItem[];
  pagination: BackendTransactionsPagination;
}

/**
 * Fetch transactions list GET /api/v1/admin/transactions
 */
export async function getAdminTransactions(
  params?: GetAdminTransactionsParams
): Promise<GetAdminTransactionsResponse> {
  const cleanParams: Record<string, unknown> = {};

  if (params?.pageNum !== undefined) cleanParams.pageNum = params.pageNum;
  if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
  if (params?.status && params.status !== 'ALL') cleanParams.status = params.status;
  if (params?.orderId && params.orderId.trim()) cleanParams.orderId = params.orderId.trim();
  if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params?.dateFrom) cleanParams.dateFrom = params.dateFrom;
  if (params?.dateTo) cleanParams.dateTo = params.dateTo;
  if (params?.amountMin !== undefined && !isNaN(params.amountMin)) cleanParams.amountMin = params.amountMin;
  if (params?.amountMax !== undefined && !isNaN(params.amountMax)) cleanParams.amountMax = params.amountMax;

  const response = await api.get('/admin/transactions', { params: cleanParams });
  const resData = response.data;

  let items: BackendTransactionItem[] = [];
  let pagination: BackendTransactionsPagination = {
    currentPage: params?.pageNum ?? 1,
    pageSize: params?.pageSize ?? 20,
    totalItems: 0,
    totalPages: 0,
  };

  if (resData) {
    const d = resData.data || resData;
    if (Array.isArray(d.items)) {
      items = d.items;
    } else if (Array.isArray(d)) {
      items = d;
    }

    const p = d.pagination || resData.pagination;
    if (p && typeof p === 'object') {
      pagination = {
        currentPage: Number(p.currentPage ?? params?.pageNum ?? 1),
        pageSize: Number(p.pageSize ?? params?.pageSize ?? 20),
        totalItems: Number(p.totalItems ?? items.length),
        totalPages: Number(p.totalPages ?? (items.length > 0 ? 1 : 0)),
      };
    } else {
      pagination = {
        currentPage: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 20,
        totalItems: items.length,
        totalPages: items.length > 0 ? 1 : 0,
      };
    }
  }

  return { items, pagination };
}

/**
 * Maps a backend transaction item to the UI TransactionItem structure
 */
export function mapBackendTransactionToUI(item: BackendTransactionItem): TransactionItem {
  let orderNo = '--';
  if (typeof item.orderNumber === 'string' && item.orderNumber.trim()) {
    orderNo = item.orderNumber.startsWith('#') ? item.orderNumber : `#${item.orderNumber}`;
  } else if (typeof item.orderNumber === 'object' && item.orderNumber !== null) {
    const obj = item.orderNumber as Record<string, unknown>;
    const val = obj.orderNumber || obj.id || obj.number;
    if (val) orderNo = String(val).startsWith('#') ? String(val) : `#${val}`;
  } else if (item.orderId) {
    orderNo = item.orderId.startsWith('#') ? item.orderId : `#${item.orderId}`;
  }

  let buyerName = '--';
  if (typeof item.buyerName === 'string' && item.buyerName.trim()) {
    buyerName = item.buyerName;
  } else if (typeof item.buyerName === 'object' && item.buyerName !== null) {
    const obj = item.buyerName as Record<string, unknown>;
    const firstName = typeof obj.firstName === 'string' ? obj.firstName : '';
    const lastName = typeof obj.lastName === 'string' ? obj.lastName : '';
    const fullName = `${firstName} ${lastName}`.trim() || (typeof obj.name === 'string' ? obj.name : '');
    if (fullName) buyerName = fullName;
  }

  let fatoorahRef = '--';
  if (typeof item.gatewayReference === 'string' && item.gatewayReference.trim()) {
    fatoorahRef = item.gatewayReference;
  } else if (typeof item.gatewayReference === 'object' && item.gatewayReference !== null) {
    const obj = item.gatewayReference as Record<string, unknown>;
    const val = obj.reference || obj.id || obj.code || obj.ref;
    if (val) fatoorahRef = String(val);
  }

  let date = '--';
  if (item.createdAt) {
    const d = new Date(item.createdAt);
    if (!isNaN(d.getTime())) {
      date = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  return {
    id: item.id || '---',
    orderNo,
    date,
    buyerName,
    amount: typeof item.amount === 'number' ? item.amount : 0,
    paymentMethod: item.paymentMethod || 'CASH',
    status: item.status || 'PENDING',
    fatoorahRef,
    rawPaymentStatus: item.status || undefined,
  };
}
