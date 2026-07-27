import { api } from './api';
import type { TransactionItem } from '../features/transactions/types/transaction.types';
import type { TableItem } from '../features/Orders/types';

export interface AdminOrderItem {
  id: string;
  buyerAccountId?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingZone?: string;
  shippingCity?: string;
  shippingStreetAddress?: string;
  shippingBuildingNumber?: unknown;
  shippingAdditionalDirections?: unknown;
  subtotalAmount?: number;
  shippingTotalAmount?: number;
  grandTotalAmount?: number;
  voucherId?: unknown;
  discountAmount?: number;
  paymentStatus?: string;
  overallStatus?: string;
  subOrders?: Array<{
    id: string;
    orderId: string;
    vendorId: string;
    status: string;
    shippingRateApplied: number;
    trackingNumber?: unknown;
    statusOverrideReason?: unknown;
    shippedAt?: unknown;
    deliveredAt?: unknown;
    items?: Array<{
      id: string;
      productId?: unknown;
      variantId?: unknown;
      productName: string;
      variantLabel?: unknown;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      isRefunded?: boolean;
      commissionRateApplied?: number;
    }>;
    createdAt?: string;
  }>;
  createdAt?: string;
}

export interface AdminOrdersResponse {
  items: AdminOrderItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminOrderDetailItem {
  id: string;
  productId?: unknown;
  variantId?: unknown;
  productName: string;
  variantLabel?: unknown;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isRefunded?: boolean;
  commissionRateApplied?: number;
}

export interface AdminSubOrder {
  id: string;
  orderId: string;
  vendorId: string;
  status: string;
  shippingRateApplied: number;
  trackingNumber?: unknown;
  statusOverrideReason?: unknown;
  shippedAt?: unknown;
  deliveredAt?: unknown;
  items: AdminOrderDetailItem[];
  createdAt: string;
}

export interface AdminOrderDetailResponse {
  id: string;
  buyerAccountId?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingZone?: string;
  shippingCity?: string;
  shippingStreetAddress?: string;
  shippingBuildingNumber?: unknown;
  shippingAdditionalDirections?: unknown;
  subtotalAmount: number;
  shippingTotalAmount: number;
  grandTotalAmount: number;
  voucherId?: unknown;
  discountAmount: number;
  paymentStatus: string;
  overallStatus: string;
  subOrders: AdminSubOrder[];
  createdAt: string;
}

/**
 * Fetch orders list from /api/v1/admin/orders
 */
export async function getAdminOrders(params?: {
  pageNum?: number;
  pageSize?: number;
}): Promise<AdminOrdersResponse> {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 20;

  const response = await api.get('/admin/orders', {
    params: {
      pageNum,
      pageSize,
    },
  });

  const resData = response.data;

  let items: AdminOrderItem[] = [];
  let pagination = {
    currentPage: pageNum,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  };

  if (resData) {
    if (Array.isArray(resData.items)) {
      items = resData.items;
      if (resData.pagination) {
        pagination = { ...pagination, ...resData.pagination };
      }
    } else if (resData.data && Array.isArray(resData.data.items)) {
      items = resData.data.items;
      if (resData.data.pagination) {
        pagination = { ...pagination, ...resData.data.pagination };
      }
    } else if (Array.isArray(resData.data)) {
      items = resData.data;
    } else if (Array.isArray(resData)) {
      items = resData;
    }
  }

  return { items, pagination };
}

/**
 * Fetch single order details by ID from /api/v1/admin/orders/{id}
 */
export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetailResponse> {
  const response = await api.get(`/admin/orders/${id}`);
  const data = response.data;
  return data?.data || data;
}

export interface UpdateSubOrderStatusPayload {
  status: string;
  reason?: string;
  trackingNumber?: string;
}

/**
 * Patch sub-order status and tracking number: /api/v1/admin/sub-orders/{id}/status
 */
export async function updateAdminSubOrderStatus(
  subOrderId: string,
  payload: UpdateSubOrderStatusPayload
): Promise<AdminSubOrder> {
  const response = await api.patch(`/admin/sub-orders/${subOrderId}/status`, payload);
  const data = response.data;
  return data?.data || data;
}

/**
 * Map API AdminOrderItem object directly preserving paymentStatus field for Transactions page
 */
export function mapAdminOrderToTransactionItem(order: AdminOrderItem): TransactionItem {
  const rawStatus = order.paymentStatus || order.overallStatus || 'PENDING';

  const shortId = order.id ? (order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order.id) : 'N/A';
  const orderNo = `#ORD-${shortId}`;
  const date = order.createdAt
    ? new Date(order.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    id: order.id || Math.random().toString(),
    orderNo,
    date,
    buyerName: order.recipientName || 'Guest Buyer',
    amount: order.grandTotalAmount ?? order.subtotalAmount ?? 0,
    paymentMethod: 'Online Payment',
    status: rawStatus,
    rawPaymentStatus: rawStatus,
    fatoorahRef: `MF-${shortId}`,
  };
}

/**
 * Map API AdminOrderItem object preserving overallStatus for Orders page
 */
export function mapAdminOrderToTableItem(order: AdminOrderItem): TableItem {
  const shortId = order.id ? (order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order.id) : 'N/A';
  const code = `#ORD-${shortId}`;
  const total = order.grandTotalAmount ?? order.subtotalAmount ?? 0;
  const totalFormatted = `${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;

  // Use overallStatus from backend for Orders page
  const rawStatus = (order.overallStatus || order.paymentStatus || 'PENDING').toUpperCase();

  const subOrdersCount = order.subOrders ? order.subOrders.length : 0;

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return {
    id: order.id,
    code,
    customer: order.recipientName || 'Guest Buyer',
    vendor: 'Direct Store',
    total,
    totalFormatted,
    status: rawStatus,
    subOrdersCount,
    date: dateStr,
  };
}
