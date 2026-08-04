import { api } from './api';
import type { TableItem } from '../features/Orders/types';

export interface AdminRefundItemProduct {
  id: string;
  orderItemId: string;
  reason?: string;
  refundAmount: number;
  productNameSnapshot: string;
  variantLabelSnapshot?: unknown;
  unitPriceSnapshot: number;
  thumbnailUrl?: unknown;
  vendorId?: string;
}

export interface AdminRefundCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface AdminRefundShipping {
  recipientName?: string;
  recipientPhone?: string;
  shippingCity?: string;
  shippingStreetAddress?: string;
  shippingBuildingNumber?: unknown;
  shippingAdditionalDirections?: unknown;
}

export interface AdminRefund {
  id: string;
  orderId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  rejectionReason?: unknown;
  items: AdminRefundItemProduct[];
  totalRefundAmount: number;
  imageUrls?: string[];
  createdAt: string;
  internalNotes?: unknown;
  customer?: AdminRefundCustomer;
  shipping?: AdminRefundShipping;
  vendorStoreName?: unknown;
  paymentMethod?: string;
}

export interface AdminRefundsResponse {
  items: AdminRefund[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetAdminRefundsParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  vendorId?: string;
  orderId?: string;
  search?: string;
  startDate?: string;
}

/**
 * Fetch refunds list from GET /api/v1/admin/refunds
 */
export async function getAdminRefunds(params?: GetAdminRefundsParams): Promise<AdminRefundsResponse> {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 20;

  const response = await api.get('/admin/refunds', {
    params: {
      pageNum,
      page: pageNum,
      pageSize,
      limit: pageSize,
      perPage: pageSize,
      per_page: pageSize,
      status: params?.status,
      vendorId: params?.vendorId,
      orderId: params?.orderId,
      search: params?.search || undefined,
      q: params?.search || undefined,
      query: params?.search || undefined,
      startDate: params?.startDate,
    },
  });

  const resData = response.data;
  let items: AdminRefund[] = [];
  let pagination = {
    currentPage: params?.pageNum ?? 1,
    pageSize: params?.pageSize ?? 25,
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
 * Fetch single refund detail from GET /api/v1/admin/refunds/{id}
 */
export async function getAdminRefundDetail(id: string): Promise<AdminRefund> {
  const response = await api.get(`/admin/refunds/${id}`);
  const data = response.data;
  return data?.data || data;
}

/**
 * Approve refund: PATCH /api/v1/admin/refunds/{id}/approve
 */
export async function approveAdminRefund(id: string): Promise<AdminRefund> {
  const response = await api.patch(`/admin/refunds/${id}/approve`);
  const data = response.data;
  return data?.data || data;
}

/**
 * Reject refund: PATCH /api/v1/admin/refunds/{id}/reject
 */
export async function rejectAdminRefund(id: string, reason: string): Promise<AdminRefund> {
  const response = await api.patch(`/admin/refunds/${id}/reject`, { reason });
  const data = response.data;
  return data?.data || data;
}

/**
 * Update refund notes: PATCH /api/v1/admin/refunds/{id}/notes
 */
export async function updateAdminRefundNotes(id: string, notes: string): Promise<AdminRefund> {
  const response = await api.patch(`/admin/refunds/${id}/notes`, { notes });
  const data = response.data;
  return data?.data || data;
}

/**
 * Helper to map backend AdminRefund object to TableItem format for UI components
 */
export function mapAdminRefundToTableItem(refund: AdminRefund): TableItem {
  const shortId = refund.id ? (refund.id.length > 8 ? refund.id.slice(-6).toUpperCase() : refund.id) : 'N/A';
  const code = `#REF-${shortId}`;
  const orderIdShort = refund.orderId
    ? refund.orderId.length > 8
      ? refund.orderId.slice(-6).toUpperCase()
      : refund.orderId
    : 'N/A';
  const orderCode = `#ORD-${orderIdShort}`;

  const customerName = refund.customer
    ? `${refund.customer.firstName || ''} ${refund.customer.lastName || ''}`.trim() || '--'
    : refund.shipping?.recipientName || '--';

  const vendorName =
    typeof refund.vendorStoreName === 'string' && refund.vendorStoreName
      ? refund.vendorStoreName
      : '--';

  const reasonStr = refund.items?.[0]?.reason
    ? refund.items[0].reason.replace(/_/g, ' ')
    : typeof refund.rejectionReason === 'string'
    ? refund.rejectionReason
    : '--';

  const dateStr = refund.createdAt
    ? new Date(refund.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return {
    id: refund.id,
    code,
    orderId: orderCode,
    customer: customerName,
    vendor: vendorName,
    total: refund.totalRefundAmount || 0,
    totalFormatted: `${(refund.totalRefundAmount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} SAR`,
    status: (refund.status || 'PENDING').toUpperCase(),
    subOrdersCount: refund.items?.length || 1,
    reason: reasonStr,
    date: dateStr,
  };
}
