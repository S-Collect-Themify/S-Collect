// Refunds service
// Matches backend response format from /vendor/refunds

import { api, handleServiceError } from './api';

export interface VendorRefundProductItem {
  id: string;
  orderItemId: string;
  reason: string;
  refundAmount: number;
  productNameSnapshot: string;
  variantLabelSnapshot?: string | null;
  unitPriceSnapshot: number;
  thumbnailUrl?: string | null;
  vendorId: string;
}

export interface VendorRefundCustomer {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface VendorRefundShipping {
  recipientName?: string | null;
  recipientPhone?: string | null;
  shippingCity?: string | null;
  shippingStreetAddress?: string | null;
  shippingBuildingNumber?: string | null;
  shippingAdditionalDirections?: string | null;
}

export interface VendorRefundItem {
  id: string;
  refundNumber?: number | null;
  orderId: string;
  orderNumber?: number | string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  rejectionReason?: string | null;
  items: VendorRefundProductItem[];
  totalRefundAmount: number;
  imageUrls?: string[];
  createdAt: string;
  internalNotes?: string | null;
  customer?: VendorRefundCustomer | null;
  shipping?: VendorRefundShipping | null;
  vendorStoreName?: string | null;
  orderGrandTotalAmount?: number | null;
  paymentMethod?: 'CASH' | 'VISA' | 'APPLE_PAY' | string | null;
}

// Alias for backwards compatibility
export type RefundItem = VendorRefundItem;

export interface PaginatedRefundList {
  items: VendorRefundItem[];
  pagination: {
    currentPage: number;
    pageSize?: number;
    itemsPerPage?: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Fetch a paginated list of refunds from /vendor/refunds
 */
export async function getRefunds(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedRefundList> {
  try {
    const response = await api.get('/vendor/refunds', { params });
    const payload = response.data?.data || response.data;

    return {
      items: payload?.items || [],
      pagination: payload?.pagination || {
        currentPage: 1,
        pageSize: 25,
        totalItems: (payload?.items || []).length,
        totalPages: 1,
      },
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch refunds');
  }
}

/**
 * Fetch details of a single refund by its ID.
 */
export async function getRefundDetail(id: string): Promise<VendorRefundItem> {
  try {
    const response = await api.get(`/vendor/refunds/${id}`);
    const payload = response.data?.data || response.data;
    if (payload && (payload.id || payload.orderId)) {
      return payload.id ? payload : payload.item;
    }
    if (payload?.item) return payload.item;
  } catch {
    // If GET /vendor/refunds/:id is not supported (404), fallback to searching the refunds list
  }

  try {
    const listResponse = await api.get('/vendor/refunds', {
      params: { limit: 100 },
    });
    const payload = listResponse.data?.data || listResponse.data;
    const items: VendorRefundItem[] = payload?.items || [];
    const found = items.find((item) => item.id === id);
    if (found) {
      return found;
    }
  } catch (err) {
    throw handleServiceError(err, `Failed to fetch refund ${id}`);
  }

  throw new Error(`Refund ${id} not found`);
}

/**
 * Create a new refund request.
 */
export async function createRefund(data: {
  orderId: string;
  amount: number;
  reason?: string;
}): Promise<VendorRefundItem> {
  try {
    const response = await api.post('/vendor/refunds', data);
    const payload = response.data?.data || response.data;
    return payload;
  } catch (err) {
    throw handleServiceError(err, 'Failed to create refund');
  }
}

/**
 * Update an existing refund (e.g., change status, adjust amount).
 */
export async function updateRefund(
  id: string,
  data: Partial<{
    status: VendorRefundItem['status'];
    amount: number;
    reason: string;
  }>
): Promise<VendorRefundItem> {
  try {
    const response = await api.patch(`/vendor/refunds/${id}`, data);
    const payload = response.data?.data || response.data;
    return payload;
  } catch (err) {
    throw handleServiceError(err, `Failed to update refund ${id}`);
  }
}

/**
 * Approve a refund request.
 */
export async function approveRefund(
  id: string,
  data?: { note?: string }
): Promise<VendorRefundItem> {
  try {
    const response = await api.patch(`/vendor/refunds/${id}/approve`);
    return response.data?.data || response.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      try {
        const fallbackRes = await api.patch(`/vendor/refunds/${id}`, {
          status: 'APPROVED',
          internalNotes: data?.note,
        });
        return fallbackRes.data?.data || fallbackRes.data;
      } catch {}
    }
    throw handleServiceError(err, `Failed to approve refund ${id}`);
  }
}

export async function rejectRefund(
  id: string,
  data?: { reason?: string }
): Promise<VendorRefundItem> {
  try {
    const response = await api.patch(`/vendor/refunds/${id}/reject`, {
      reason: data?.reason || 'Request rejected by vendor',
    });
    return response.data?.data || response.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      try {
        const fallbackRes = await api.patch(`/vendor/refunds/${id}`, {
          status: 'REJECTED',
          rejectionReason: data?.reason,
        });
        return fallbackRes.data?.data || fallbackRes.data;
      } catch {}
    }
    throw handleServiceError(err, `Failed to reject refund ${id}`);
  }
}

export async function setRefundInternalNotes(
  id: string,
  notes: string
): Promise<VendorRefundItem> {
  try {
    const response = await api.patch(`/vendor/refunds/${id}/notes`, { notes });
    return response.data?.data || response.data;
  } catch (err) {
    throw handleServiceError(err, `Failed to set notes on refund ${id}`);
  }
}

/**
 * Process a refund (trigger payout/refund execution).
 */
export async function processRefund(
  id: string,
  data?: { amount?: number; notes?: string }
): Promise<VendorRefundItem> {
  try {
    const response = await api.post(`/vendor/refunds/${id}/process`, data);
    const payload = response.data?.data || response.data;
    return payload;
  } catch (err) {
    throw handleServiceError(err, `Failed to process refund ${id}`);
  }
}
