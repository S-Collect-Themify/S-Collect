import { api } from './api';

export interface BackendVendor {
  id: string;
  firstName: string;
  lastName: string;
  storeName: string;
  commercialRegisterNumber: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED';
  isFeatured?: boolean;
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

/**
 * Deactivate a vendor POST /api/v1/admin/vendors/{id}/deactivate
 */
export async function deactivateVendor(id: string): Promise<void> {
  await api.post(`/admin/vendors/${id}/deactivate`);
}

/**
 * Reactivate a vendor POST /api/v1/admin/vendors/{id}/reactivate
 */
export async function reactivateVendor(id: string): Promise<void> {
  await api.post(`/admin/vendors/${id}/reactivate`);
}
