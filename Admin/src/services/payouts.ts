import { api } from './api';

export interface AdminPayoutsSummary {
  totalPayoutsRegistered: number;
  pendingPayouts: number;
  vendorsWithPending: number;
}

export interface BackendPendingVendorPayoutItem {
  vendorId: string;
  storeName: string;
  totalGmv: number;
  commission: number;
  totalPayouts: number;
  pendingPayout: number;
}

export interface PendingVendorPayoutsResponse {
  items: BackendPendingVendorPayoutItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetPendingVendorsParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * Fetch payouts summary GET /api/v1/admin/payouts/summary
 */
export async function getAdminPayoutsSummary(): Promise<AdminPayoutsSummary> {
  const response = await api.get('/admin/payouts/summary');
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as AdminPayoutsSummary;
  }
  return resData as AdminPayoutsSummary;
}

/**
 * Fetch pending vendors payouts list GET /api/v1/admin/payouts/pending-vendors
 */
export async function getAdminPendingVendorPayouts(
  params?: GetPendingVendorsParams
): Promise<PendingVendorPayoutsResponse> {
  const response = await api.get('/admin/payouts/pending-vendors', {
    params: {
      pageNum: params?.pageNum ?? 1,
      pageSize: params?.pageSize ?? 25,
    },
  });

  const resData = response.data;
  const obj = (resData && typeof resData === 'object' && 'data' in resData && resData.data)
    ? resData.data
    : resData;

  const items: BackendPendingVendorPayoutItem[] = Array.isArray(obj?.items)
    ? obj.items
    : Array.isArray(obj)
    ? obj
    : [];

  const pagination = (obj?.pagination as any) || {
    currentPage: params?.pageNum ?? 1,
    pageSize: params?.pageSize ?? 25,
    totalItems: items.length,
    totalPages: 1,
  };

  return {
    items,
    pagination: {
      currentPage: Number(pagination.currentPage ?? 1),
      pageSize: Number(pagination.pageSize ?? 25),
      totalItems: Number(pagination.totalItems ?? items.length),
      totalPages: Number(pagination.totalPages ?? 1),
    },
  };
}

export interface CreateVendorPayoutPayload {
  amount: number;
  isAdjustment?: boolean;
  referenceNote?: string;
  transferDate?: string;
  clarifyingNote?: string;
}

export interface CreatedVendorPayoutResponse {
  id: string;
  ref?: number | string;
  vendorId: string;
  amount: number;
  isAdjustment?: boolean;
  status: string;
  referenceNote?: any;
  transferDate?: string;
  recordedByAdminId?: string;
  clarifyingNote?: any;
  createdAt: string;
}

/**
 * Record a vendor payout POST /api/v1/admin/vendors/{vendorId}/payouts
 */
export async function createVendorPayout(
  vendorId: string,
  payload: CreateVendorPayoutPayload
): Promise<CreatedVendorPayoutResponse> {
  const transferDateStr = payload.transferDate
    ? (payload.transferDate.includes('T')
        ? payload.transferDate.split('T')[0]
        : payload.transferDate)
    : new Date().toISOString().split('T')[0];

  const body: Record<string, any> = {
    amount: Number(payload.amount),
    isAdjustment: Boolean(payload.isAdjustment),
    transferDate: transferDateStr,
  };

  if (payload.referenceNote?.trim()) {
    body.referenceNote = payload.referenceNote.trim();
  }
  if (payload.clarifyingNote?.trim()) {
    body.clarifyingNote = payload.clarifyingNote.trim();
  }

  const response = await api.post(`/admin/vendors/${vendorId}/payouts`, body);
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as CreatedVendorPayoutResponse;
  }
  return resData as CreatedVendorPayoutResponse;
}
