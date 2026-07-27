// Refunds service
// This file provides functions to interact with the Refunds API.
// It follows the same pattern as other service files (e.g., returns.ts).

import { api, handleServiceError } from './api';

export interface RefundItem {
  id: string;
  orderId: string;
  vendorId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRefundList {
  items: RefundItem[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Fetch a paginated list of refunds.
 */
export async function getRefunds(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedRefundList> {
  try {
    const response = await api.get('/vendor/refunds', { params });
    return response.data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch refunds');
  }
}

/**
 * Fetch details of a single refund by its ID.
 */
export async function getRefundDetail(id: string): Promise<RefundItem> {
  try {
    const response = await api.get(`/vendor/refunds/${id}`);
    return response.data;
  } catch (err) {
    throw handleServiceError(err, `Failed to fetch refund ${id}`);
  }
}

/**
 * Create a new refund request.
 */
export async function createRefund(data: {
  orderId: string;
  amount: number;
  reason?: string;
}): Promise<RefundItem> {
  try {
    const response = await api.post('/vendor/refunds', data);
    return response.data;
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
    status: RefundItem['status'];
    amount: number;
    reason: string;
  }>
): Promise<RefundItem> {
  try {
    const response = await api.patch(`/vendor/refunds/${id}`, data);
    return response.data;
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
): Promise<RefundItem> {
  try {
    const response = await api.post(`/vendor/refunds/${id}/approve`, data);
    return response.data;
  } catch (err) {
    // Fallback to PATCH status if endpoint is patch-based
    try {
      const fallbackResponse = await api.patch(`/vendor/refunds/${id}`, {
        status: 'APPROVED',
        ...data,
      });
      return fallbackResponse.data;
    } catch {
      throw handleServiceError(err, `Failed to approve refund ${id}`);
    }
  }
}

/**
 * Reject a refund request.
 */
export async function rejectRefund(
  id: string,
  data?: { reason?: string }
): Promise<RefundItem> {
  try {
    const response = await api.post(`/vendor/refunds/${id}/reject`, data);
    return response.data;
  } catch (err) {
    // Fallback to PATCH status if endpoint is patch-based
    try {
      const fallbackResponse = await api.patch(`/vendor/refunds/${id}`, {
        status: 'REJECTED',
        ...data,
      });
      return fallbackResponse.data;
    } catch {
      throw handleServiceError(err, `Failed to reject refund ${id}`);
    }
  }
}

/**
 * Process a refund (trigger payout/refund execution).
 */
export async function processRefund(
  id: string,
  data?: { amount?: number; notes?: string }
): Promise<RefundItem> {
  try {
    const response = await api.post(`/vendor/refunds/${id}/process`, data);
    return response.data;
  } catch (err) {
    throw handleServiceError(err, `Failed to process refund ${id}`);
  }
}

