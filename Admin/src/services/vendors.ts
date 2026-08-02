import { api } from './api';

export interface BackendVendor {
  id: string;
  email?: string | Record<string, unknown>;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  commercialRegisterNumber?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED';
  isFeatured?: boolean;
  commissionRate?: number | string | Record<string, unknown> | null;
  createdAt?: string;
}

export interface BackendVendorDetail {
  id: string;
  email?: string | Record<string, unknown> | null;
  publicEmail?: string | Record<string, unknown> | null;
  publicPhoneNumber?: string | Record<string, unknown> | null;
  logoUrl?: string | Record<string, unknown> | null;
  commissionRate?: number | string | Record<string, unknown> | null;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  storeDescription?: string | Record<string, unknown> | null;
  commercialRegisterNumber?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED';
  isFeatured?: boolean;
  approvedAt?: string | null;
  rejectionReason?: string | Record<string, unknown> | null;
  deactivationReason?: string | Record<string, unknown> | null;
  createdAt?: string;
}

export interface GetVendorsParams {
  status?: string;
}

function extractVendorArray(resData: unknown): BackendVendor[] {
  if (Array.isArray(resData)) {
    return resData;
  }
  const obj = resData as { data?: unknown; items?: unknown };
  if (obj?.data && Array.isArray(obj.data)) {
    return obj.data;
  }
  if (obj?.items && Array.isArray(obj.items)) {
    return obj.items;
  }
  return [];
}

/**
 * Fetch vendors list from GET /api/v1/admin/vendors
 * Supports single status or comma-separated status strings (e.g. 'ACTIVE,DEACTIVATED')
 * Automatically sorts results by createdAt timestamp descending (latest updated first).
 */
export async function getVendors(params?: GetVendorsParams): Promise<BackendVendor[]> {
  const statusParam = params?.status;
  let rawVendors: BackendVendor[] = [];

  if (statusParam && statusParam.includes(',')) {
    const statusList = statusParam.split(',').map((s) => s.trim());
    const results = await Promise.all(
      statusList.map(async (status) => {
        const response = await api.get('/admin/vendors', { params: { status } });
        return extractVendorArray(response.data);
      })
    );
    rawVendors = results.flat();
  } else {
    const response = await api.get('/admin/vendors', {
      params: statusParam ? { status: statusParam } : undefined,
    });
    rawVendors = extractVendorArray(response.data);
  }

  // Sort by creation / update date descending (latest first)
  rawVendors.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return b.id.localeCompare(a.id);
  });

  return rawVendors;
}

/**
 * Fetch single vendor details by ID GET /api/v1/admin/vendors/{id}
 */
export async function getVendorById(id: string): Promise<BackendVendorDetail> {
  const response = await api.get(`/admin/vendors/${id}`);
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as BackendVendorDetail;
  }
  return resData as BackendVendorDetail;
}

/**
 * Approve a pending vendor POST /api/v1/admin/vendors/{id}/approve
 */
export async function approveVendor(id: string): Promise<void> {
  await api.post(`/admin/vendors/${id}/approve`);
}

export interface RejectVendorPayload {
  reason: string;
}

/**
 * Reject a pending vendor POST /api/v1/admin/vendors/{id}/reject
 */
export async function rejectVendor(id: string, payload: RejectVendorPayload): Promise<void> {
  await api.post(`/admin/vendors/${id}/reject`, payload);
}

export interface DeactivateVendorPayload {
  reason?: string;
}

/**
 * Deactivate a vendor POST /api/v1/admin/vendors/{id}/deactivate
 * Request body: { "reason": "..." }
 */
export async function deactivateVendor(
  id: string,
  payload?: DeactivateVendorPayload
): Promise<void> {
  const body = {
    reason: payload?.reason?.trim() || 'Deactivated by administrator.',
  };
  await api.post(`/admin/vendors/${id}/deactivate`, body);
}

/**
 * Reactivate a vendor POST /api/v1/admin/vendors/{id}/reactivate
 */
export async function reactivateVendor(id: string): Promise<void> {
  await api.post(`/admin/vendors/${id}/reactivate`);
}

export interface GetVendorPayoutsParams {
  pageNum?: number;
  pageSize?: number;
}

export interface BackendVendorPayoutItem {
  id: string;
  vendorId: string;
  amount: string | number;
  isAdjustment?: boolean;
  referenceNote?: string | Record<string, any> | null;
  transferDate?: string;
  recordedByAdminId?: string;
  clarifyingNote?: string | Record<string, any> | null;
  createdAt?: string;
  status?: string;
}

export interface VendorPayoutsResponse {
  items: BackendVendorPayoutItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Fetch vendor payouts list GET /api/v1/admin/vendors/{vendorId}/payouts
 */
export async function getVendorPayouts(
  vendorId: string,
  params?: GetVendorPayoutsParams
): Promise<any> {
  try {
    const response = await api.get(`/admin/vendors/${vendorId}/payouts`, { params });
    return response.data;
  } catch (err) {
    console.warn(`API getVendorPayouts (${vendorId}) error:`, err);
    return null;
  }
}
