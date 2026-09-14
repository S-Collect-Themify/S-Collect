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
  phoneNumber?: string | Record<string, unknown> | null;
  logoUrl?: string | Record<string, unknown> | null;
  commissionRate?: number | string | Record<string, unknown> | null;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  storeNameAr?: string;
  storeDescription?: string | Record<string, unknown> | null;
  commercialRegisterNumber?: string;
  lowStockThreshold?: number | string | null;
  flatShippingRate?: number | string | null;
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

export interface UpdateVendorPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  storeName?: string;
  storeNameAr?: string;
  storeDescription?: string | Record<string, unknown>;
  publicEmail?: string;
  publicPhoneNumber?: string;
  commercialRegisterNumber?: string;
  lowStockThreshold?: number;
  flatShippingRate?: number;
}

export interface CreateVendorPayload extends UpdateVendorPayload {
  password: string;
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
  } else if (obj.data && typeof obj.data === 'object' && Array.isArray((obj.data as any).vendors)) {
    items = (obj.data as any).vendors;
  } else if (Array.isArray((resData as any).vendors)) {
    items = (resData as any).vendors;
  } else if (Array.isArray((resData as any).vendorsList)) {
    items = (resData as any).vendorsList;
  } else if (Array.isArray((resData as any).result)) {
    items = (resData as any).result;
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

  if (params?.pageNum !== undefined) {
    queryParams.pageNum = params.pageNum;
    queryParams.page = params.pageNum;
  }
  if (params?.pageSize !== undefined) {
    queryParams.pageSize = Math.min(params.pageSize, 100);
  } else {
    queryParams.pageSize = 100;
  }
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.status?.trim()) queryParams.status = params.status.trim();

  const fetchWithParams = async (p: Record<string, any>): Promise<BackendVendorsResponse> => {
    const response = await api.get('/admin/vendors', { params: p });
    const extracted = extractVendorResponse(response.data);

    // If caller explicitly requested a single specific pageNum, return immediately
    if (params?.pageNum !== undefined) {
      return extracted;
    }

    let items = [...extracted.items];
    const firstPageCount = items.length;
    const reportedTotalPages = extracted.pagination.totalPages;
    const reportedTotalItems = extracted.pagination.totalItems;

    // Check if there could be more pages:
    // If page 1 has items and (items.length >= 25 || reportedTotalPages > 1 || reportedTotalItems > items.length)
    const shouldFetchMore =
      items.length > 0 &&
      (firstPageCount >= 25 || reportedTotalPages > 1 || reportedTotalItems > items.length);

    if (shouldFetchMore) {
      let currentPage = 2;
      const maxPages = 50; // Safety cap (up to 50 * 25 = 1250 items)

      while (currentPage <= maxPages) {
        const batchPages = [currentPage, currentPage + 1, currentPage + 2, currentPage + 3, currentPage + 4];
        const batchPromises = batchPages.map((pageNum) =>
          api
            .get('/admin/vendors', { params: { ...p, pageNum, page: pageNum } })
            .then((res) => extractVendorResponse(res.data).items)
            .catch(() => [] as BackendVendor[])
        );

        const batchResults = await Promise.all(batchPromises);
        let reachedEnd = false;

        for (const pageItems of batchResults) {
          if (!pageItems || pageItems.length === 0) {
            reachedEnd = true;
            break;
          }
          items.push(...pageItems);
          if (pageItems.length < firstPageCount && firstPageCount >= 25) {
            reachedEnd = true;
            break;
          }
        }

        if (reachedEnd) {
          break;
        }
        currentPage += 5;
      }

      // Deduplicate by ID
      const seen = new Set<string>();
      items = items.filter((item) => {
        const id = String(item.id || (item as any)._id || '');
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    return {
      items,
      pagination: {
        currentPage: 1,
        pageSize: items.length || 25,
        totalItems: items.length,
        totalPages: 1,
      },
    };
  };

  try {
    const res = await fetchWithParams(queryParams);
    if (res.items && res.items.length > 0) {
      return res;
    }
  } catch {
    // Primary query params attempt failed, try fallback
  }

  // Fallback 1: Try without extra overrides
  try {
    const cleanParams: Record<string, any> = {};
    if (params?.search?.trim()) cleanParams.search = params.search.trim();
    if (params?.status?.trim()) cleanParams.status = params.status.trim();
    const res = await fetchWithParams(cleanParams);
    if (res.items && res.items.length > 0) {
      return res;
    }
  } catch {
    // Clean params attempt failed, try unconstrained fallback
  }

  // Fallback 2: Completely unconstrained GET /admin/vendors + client-side filter
  try {
    const res = await fetchWithParams({});
    let filteredItems = res.items || [];

    if (params?.status?.trim()) {
      const targetStatus = params.status.trim().toUpperCase();
      filteredItems = filteredItems.filter((v: any) => {
        const st = String(v.status || '').toUpperCase();
        if (targetStatus === 'PENDING_APPROVAL') return st === 'PENDING_APPROVAL' || st === 'PENDING';
        if (targetStatus === 'ACTIVE') return st === 'ACTIVE' || st === 'APPROVED';
        if (targetStatus === 'DEACTIVATED') return st === 'DEACTIVATED' || st === 'SUSPENDED';
        if (targetStatus === 'REJECTED') return st === 'REJECTED';
        return st === targetStatus;
      });
    }

    if (params?.search?.trim()) {
      const searchLower = params.search.trim().toLowerCase();
      filteredItems = filteredItems.filter((v: any) => {
        const full = `${v.storeName || ''} ${v.storeNameAr || ''} ${v.firstName || ''} ${v.lastName || ''} ${v.email || ''} ${v.id || ''}`.toLowerCase();
        return full.includes(searchLower);
      });
    }

    return {
      items: filteredItems,
      pagination: {
        currentPage: 1,
        pageSize: filteredItems.length || 25,
        totalItems: filteredItems.length,
        totalPages: 1,
      },
    };
  } catch (err2) {
    console.error('All fallback GET /admin/vendors attempts failed:', err2);
  }

  return {
    items: [],
    pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 },
  };
}

/**
 * Fetch single vendor details by ID GET /api/v1/admin/vendors/{id}
 */
export async function getVendorById(id: string): Promise<BackendVendorDetail> {
  try {
    const response = await api.get(`/admin/vendors/${id}`);
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
      return resData.data as BackendVendorDetail;
    }
    return resData as BackendVendorDetail;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw err;
    }
    try {
      const searchRes = await api.get('/admin/vendors', { params: { search: id } });
      const extracted = extractVendorResponse(searchRes.data);
      const matched =
        extracted.items.find(
          (v: any) =>
            String(v.id) === String(id) ||
            String(v._id) === String(id) ||
            String(v.vendorId) === String(id)
        );

      if (matched) return matched as unknown as BackendVendorDetail;
    } catch {
      // Fail quietly to avoid console spam
    }
    throw err;
  }
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

/**
 * Delete a vendor DELETE /api/v1/admin/vendors/{id}
 */
export async function deleteVendor(id: string): Promise<void> {
  await api.delete(`/admin/vendors/${id}`);
}

/**
 * Update a vendor PUT /api/v1/admin/vendors/{id}
 */
export async function updateVendor(
  id: string,
  payload: UpdateVendorPayload
): Promise<BackendVendorDetail> {
  const response = await api.put(`/admin/vendors/${id}`, payload);
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as BackendVendorDetail;
  }
  return resData as BackendVendorDetail;
}

/**
 * Create a vendor POST /api/v1/admin/vendors
 */
export async function createVendor(
  payload: CreateVendorPayload
): Promise<BackendVendorDetail> {
  const response = await api.post('/admin/vendors', payload);
  const resData = response.data;
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data) {
    return resData.data as BackendVendorDetail;
  }
  return resData as BackendVendorDetail;
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
