import { api } from './api';
import i18n from '../i18n';
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
  buyerAccountId?: string;
  orderId?: string;
  orderNumber?: string;
  refundNumber?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  dateFilter?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

/**
 * Fetch refunds list from GET /api/v1/admin/refunds
 */
export async function getAdminRefunds(params?: GetAdminRefundsParams): Promise<AdminRefundsResponse> {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 20;

  const cleanParams: Record<string, unknown> = {
    pageNum,
    page: pageNum,
    pageSize,
    limit: pageSize,
    perPage: pageSize,
    per_page: pageSize,
    sortBy: params?.sortBy ?? 'createdAt',
    sortOrder: params?.sortOrder ?? 'DESC',
    sort: 'createdAt:desc',
    order: 'DESC',
  };

  if (params?.status && params.status !== 'ALL' && params.status !== 'All' && params.status !== 'all') {
    cleanParams.status = params.status;
  }
  if (params?.vendorId) cleanParams.vendorId = params.vendorId;
  if (params?.buyerAccountId) cleanParams.buyerAccountId = params.buyerAccountId;
  if (params?.orderId) cleanParams.orderId = params.orderId;

  const refundSearchVal = params?.refundNumber || params?.search;
  if (refundSearchVal && refundSearchVal.trim()) {
    const stripped = refundSearchVal.trim().replace(/^(#?REF-|#)/i, '').trim();
    cleanParams.refundNumber = stripped || refundSearchVal.trim();
  }

  if (params?.dateFrom) {
    cleanParams.dateFrom = params.dateFrom;
  } else if (params?.startDate) {
    cleanParams.dateFrom = params.startDate.split('T')[0];
  }

  if (params?.dateTo) {
    cleanParams.dateTo = params.dateTo;
  } else if (params?.endDate) {
    cleanParams.dateTo = params.endDate.split('T')[0];
  }

  const response = await api.get('/admin/refunds', {
    params: cleanParams,
  });

  const resData = response.data;
  let items: AdminRefund[] = [];
  let pagination = {
    currentPage: pageNum,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  };

  if (resData) {
    const d = resData.data || resData;
    if (Array.isArray(d.items)) {
      items = d.items;
    } else if (Array.isArray(d)) {
      items = d;
    } else if (Array.isArray(resData.items)) {
      items = resData.items;
    } else if (Array.isArray(resData)) {
      items = resData;
    }

    // Sort items newest first (createdAt DESC)
    items.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      const numA = (a as any).refundNumber ?? a.id ?? '';
      const numB = (b as any).refundNumber ?? b.id ?? '';
      return String(numB).localeCompare(String(numA), undefined, { numeric: true });
    });

    const p = d.pagination || resData.pagination;
    if (p && typeof p === 'object' && ('totalItems' in p || 'total' in p || 'totalCount' in p || 'totalPages' in p)) {
      const totalItems = Number(p.totalItems ?? p.total ?? p.totalCount ?? p.count ?? items.length);
      const totalPages = Number(p.totalPages ?? p.pageCount ?? Math.max(1, Math.ceil(totalItems / pageSize)));
      pagination = {
        currentPage: Number(p.currentPage ?? p.page ?? pageNum),
        pageSize: Number(p.pageSize ?? p.limit ?? p.perPage ?? pageSize),
        totalItems,
        totalPages,
      };
    } else {
      pagination = {
        currentPage: pageNum,
        pageSize,
        totalItems: items.length,
        totalPages: items.length > 0 ? Math.max(1, Math.ceil(items.length / pageSize)) : 1,
      };
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
 * Approve refund: POST /api/v1/admin/refunds/{id}/approve (with PATCH fallback)
 */
export async function approveAdminRefund(id: string): Promise<AdminRefund> {
  try {
    const response = await api.post(`/admin/refunds/${id}/approve`);
    const data = response.data;
    return data?.data || data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      const patchRes = await api.patch(`/admin/refunds/${id}/approve`);
      const patchData = patchRes.data;
      return patchData?.data || patchData;
    }
    throw err;
  }
}

/**
 * Reject refund: POST /api/v1/admin/refunds/{id}/reject (with PATCH fallback)
 */
export async function rejectAdminRefund(id: string, reason: string): Promise<AdminRefund> {
  const trimmedReason = reason?.trim();
  if (!trimmedReason) {
    throw new Error('Rejection reason is required.');
  }

  try {
    const response = await api.post(`/admin/refunds/${id}/reject`, { reason: trimmedReason });
    const data = response.data;
    return data?.data || data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      try {
        const patchRes = await api.patch(`/admin/refunds/${id}/reject`, { reason: trimmedReason });
        const patchData = patchRes.data;
        return patchData?.data || patchData;
      } catch (patchErr: unknown) {
        const patchStatus = (patchErr as { response?: { status?: number } })?.response?.status;
        if (patchStatus === 404) {
          const altRes = await api.post(`/admin/refund-requests/${id}/reject`, { reason: trimmedReason });
          const altData = altRes.data;
          return altData?.data || altData;
        }
        throw patchErr;
      }
    }
    throw err;
  }
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
  const refundNo = (refund as any).refundNumber ?? (refund as any).refundNo ?? shortId;
  const code = `#REF-${refundNo}`;
  const orderNo = (refund as any).orderNumber ?? (refund as any).order?.orderNumber ?? (refund.orderId ? (refund.orderId.length > 8 ? refund.orderId.slice(-6).toUpperCase() : refund.orderId) : 'N/A');
  const orderCode = `#ORD-${orderNo}`;

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
    })} ${i18n.language === 'ar' ? '﷼' : 'SAR'}`,
    status: (refund.status || 'PENDING').toUpperCase(),
    subOrdersCount: refund.items?.length || 1,
    reason: reasonStr,
    date: dateStr,
    rawCreatedAt: refund.createdAt,
  };
}
