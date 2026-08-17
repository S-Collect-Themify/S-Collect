import { api } from './api';

export interface BackendVendor {
  id: string;
  email?: string | Record<string, unknown> | null;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  commercialRegisterNumber?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED';
  isFeatured?: boolean;
  commissionRate?: number | string | Record<string, unknown> | null;
  submittedDate?: string;
  createdAt?: string;
  totalRevenue?: number;
  totalOrders?: number;
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
  submittedDate?: string;
  totalRevenue?: number;
  totalOrders?: number;
}

export interface GetVendorsParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export interface BackendVendorsPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface BackendVendorsResponse {
  items: BackendVendor[];
  pagination: BackendVendorsPagination;
}

function extractVendorResponse(resData: unknown): BackendVendorsResponse {
  if (!resData || typeof resData !== 'object') {
    return {
      items: [],
      pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 },
    };
  }

  const obj = resData as {
    data?: unknown;
    items?: unknown;
    pagination?: unknown;
  };

  let items: BackendVendor[] = [];
  if (Array.isArray(obj.items)) {
    items = obj.items;
  } else if (Array.isArray(obj.data)) {
    items = obj.data;
  } else if (Array.isArray(resData)) {
    items = resData;
  } else if (obj.data && typeof obj.data === 'object' && Array.isArray((obj.data as any).items)) {
    items = (obj.data as any).items;
  }

  let pagination: BackendVendorsPagination;
  const p =
    (obj.pagination as any) ||
    (obj.data && typeof obj.data === 'object' ? (obj.data as any).pagination : null);

  if (p && typeof p === 'object') {
    pagination = {
      currentPage: Number(p.currentPage ?? p.page ?? 1),
      pageSize: Number(p.pageSize ?? p.limit ?? items.length ?? 25),
      totalItems: Number(p.totalItems ?? p.total ?? items.length),
      totalPages: Number(p.totalPages ?? p.pages ?? 1),
    };
  } else {
    pagination = {
      currentPage: 1,
      pageSize: items.length || 25,
      totalItems: items.length,
      totalPages: 1,
    };
  }

  return { items, pagination };
}

/**
 * Fetch vendors list from GET /api/v1/admin/vendors
 * Accepts pageNum, pageSize, status ('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'DEACTIVATED'), and search parameters.
 * Preserves the exact item order returned in the API response.
 */
export async function getVendors(params?: GetVendorsParams): Promise<BackendVendorsResponse> {
  const queryParams: Record<string, any> = {};

  if (params?.pageNum !== undefined) queryParams.pageNum = params.pageNum;
  if (params?.pageSize !== undefined) queryParams.pageSize = params.pageSize;
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.status?.trim()) queryParams.status = params.status.trim();

  const response = await api.get('/admin/vendors', { params: queryParams });
  return extractVendorResponse(response.data);
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

export interface BackendRecordedByAdmin {
  firstName?: string | Record<string, unknown> | null;
  lastName?: string | Record<string, unknown> | null;
  email?: string | null;
}

export interface BackendVendorPayoutItem {
  id: string;
  ref?: number | string;
  vendorId: string;
  amount: number | string;
  isAdjustment?: boolean;
  status?: string;
  referenceNote?: string | Record<string, unknown> | null;
  transferDate?: string;
  recordedByAdminId?: string;
  clarifyingNote?: string | Record<string, unknown> | null;
  createdAt?: string;
  recordedByAdmin?: BackendRecordedByAdmin | null;
}

export interface VendorPayoutsResponse {
  items: BackendVendorPayoutItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Fetch vendor payouts list GET /api/v1/admin/vendors/{vendorId}/payouts
 * Accepts pageNum, pageSize parameters.
 */
export async function getVendorPayouts(
  vendorId: string,
  params?: GetVendorPayoutsParams
): Promise<VendorPayoutsResponse | null> {
  try {
    const response = await api.get(`/admin/vendors/${vendorId}/payouts`, {
      params: {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 25,
      },
    });
    return response.data;
  } catch (err) {
    console.warn(`API getVendorPayouts (${vendorId}) error:`, err);
    return null;
  }
}

export interface BackendVendorPayoutSummary {
  totalPayout?: number | string | null;
  totalPayouts?: number | string | null;
  pendingAmount?: number | string | null;
  lastPayoutDate?: string | number | Record<string, any> | null;
}

/**
 * Fetch vendor payout summary GET /api/v1/admin/vendors/{vendorId}/payouts/summary
 */
export async function getVendorPayoutSummary(
  vendorId: string
): Promise<BackendVendorPayoutSummary | null> {
  try {
    const response = await api.get(`/admin/vendors/${vendorId}/payouts/summary`);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return resData.data as BackendVendorPayoutSummary;
    }
    return resData as BackendVendorPayoutSummary;
  } catch (err) {
    console.warn(`API getVendorPayoutSummary (${vendorId}) error:`, err);
    return null;
  }
}

export interface BackendVendorPayoutStats {
  totalSales?: number | string | null;
  productCount?: number | string | null;
  orderCount?: number | string | null;
  pendingPayouts?: number | string | null;
  pendingPayout?: number | string | null;
  totalDues?: number | string | null;
  totalDue?: number | string | null;
  invoices?: number | string | null;
}

/**
 * Fetch vendor payout stats GET /api/v1/admin/vendors/{vendorId}/payouts/stats
 */
export async function getVendorPayoutStats(
  vendorId: string
): Promise<BackendVendorPayoutStats | null> {
  try {
    const response = await api.get(`/admin/vendors/${vendorId}/payouts/stats`);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return resData.data as BackendVendorPayoutStats;
    }
    return resData as BackendVendorPayoutStats;
  } catch (err) {
    console.warn(`API getVendorPayoutStats (${vendorId}) error:`, err);
    return null;
  }
}

export interface VendorBankInfoResponse {
  bankName?: string;
  iban?: string;
  accountHolderName?: string;
}

/**
 * Fetch vendor bank info GET /api/v1/admin/vendors/{id}/bank-info
 */
export async function getVendorBankInfo(vendorId: string): Promise<VendorBankInfoResponse | null> {
  try {
    const response = await api.get(`/admin/vendors/${vendorId}/bank-info`);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return resData.data as VendorBankInfoResponse;
    }
    return resData as VendorBankInfoResponse;
  } catch (err) {
    console.warn(`API getVendorBankInfo (${vendorId}) error:`, err);
    return null;
  }
}

/**
 * Feature a vendor POST /api/v1/admin/vendors/{id}/feature
 */
export async function featureVendor(id: string): Promise<any> {
  const response = await api.post(`/admin/vendors/${id}/feature`);
  return response.data;
}

/**
 * Unfeature a vendor POST /api/v1/admin/vendors/{id}/unfeature
 */
export async function unfeatureVendor(id: string): Promise<any> {
  const response = await api.post(`/admin/vendors/${id}/unfeature`);
  return response.data;
}

export interface TopPerformingVendorItem {
  id: string;
  email?: string | Record<string, unknown> | null;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  status: string;
  isFeatured?: boolean;
  submittedDate?: string;
  totalRevenue?: number;
  deliveredOrders?: number;
}

export interface GetTopPerformingVendorsParams {
  pageNum?: number;
  pageSize?: number;
}

export interface GetTopPerformingVendorsResponse {
  items: TopPerformingVendorItem[];
  pagination: BackendVendorsPagination;
}

/**
 * Fetch top performing vendors GET /api/v1/admin/vendors/top-performing
 */
export async function getTopPerformingVendors(
  params?: GetTopPerformingVendorsParams
): Promise<GetTopPerformingVendorsResponse> {
  const cleanParams: Record<string, unknown> = {};
  if (params?.pageNum !== undefined) cleanParams.pageNum = params.pageNum;
  if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;

  const response = await api.get('/admin/vendors/top-performing', { params: cleanParams });
  const resData = response.data;

  let items: TopPerformingVendorItem[] = [];
  let pagination: BackendVendorsPagination = {
    currentPage: params?.pageNum ?? 1,
    pageSize: params?.pageSize ?? 25,
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
        pageSize: Number(p.pageSize ?? params?.pageSize ?? 25),
        totalItems: Number(p.totalItems ?? items.length),
        totalPages: Number(p.totalPages ?? (items.length > 0 ? 1 : 0)),
      };
    } else {
      pagination = {
        currentPage: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 25,
        totalItems: items.length,
        totalPages: items.length > 0 ? 1 : 0,
      };
    }
  }

  return { items, pagination };
}
