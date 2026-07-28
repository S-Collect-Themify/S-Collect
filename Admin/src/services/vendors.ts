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

/**
 * Fetch vendors list from GET /api/v1/admin/vendors
 */
export async function getVendors(params?: GetVendorsParams): Promise<BackendVendor[]> {
  const response = await api.get('/admin/vendors', {
    params: params?.status ? { status: params.status } : undefined,
  });

  const resData = response.data;
  if (Array.isArray(resData)) {
    return resData;
  }
  if (resData?.data && Array.isArray(resData.data)) {
    return resData.data;
  }
  if (resData?.items && Array.isArray(resData.items)) {
    return resData.items;
  }
  return [];
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
