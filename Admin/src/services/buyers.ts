import { api } from './api';

export interface BuyerQueryParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export interface BackendBuyer {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
  createdAt?: string | null;
  totalOrders?: number | null;
}

export interface BuyerPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface GetBuyersResponse {
  items: BackendBuyer[];
  pagination: BuyerPagination;
}

export interface AdminSavedAddress {
  id?: string;
  label?: unknown;
  recipientName?: string;
  recipientPhone?: string;
  zone?: {
    id?: string;
    code?: string;
    nameEn?: string;
    nameAr?: string;
  };
  city?: string;
  streetAddress?: string;
  buildingNumber?: unknown;
  additionalDirections?: unknown;
  isDefault?: boolean;
  createdAt?: string;
}

export interface AdminBuyerDetailResponse {
  id: string;
  image?: unknown;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: unknown;
  jointDate?: string;
  savedAddresses?: AdminSavedAddress[];
}

export interface UpdateBuyerPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateBuyerPayload extends UpdateBuyerPayload {
  password: string;
}

export async function getAdminBuyers(params: BuyerQueryParams): Promise<unknown> {
  const cleanParams: Record<string, unknown> = {};

  if (params.pageNum !== undefined) {
    cleanParams.pageNum = params.pageNum;
  }
  if (params.pageSize !== undefined) {
    cleanParams.pageSize = params.pageSize;
  }
  if (params.status && params.status !== 'all') {
    cleanParams.status = params.status;
  }
  if (params.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }

  const response = await api.get('/admin/buyers', {
    params: cleanParams,
  });

  return response.data;
}

export async function getAdminBuyerDetail(id: string): Promise<AdminBuyerDetailResponse> {
  const response = await api.get(`/admin/buyers/${id}`);
  const data = response.data;
  return data?.data || data;
}

export interface AdminBuyerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastActive?: unknown;
}

export async function getAdminBuyerStats(id: string): Promise<AdminBuyerStats> {
  const response = await api.get(`/admin/buyers/${id}/stats`);
  const data = response.data;
  return data?.data || data;
}

export interface UpdateBuyerStatusPayload {
  status: string;
}

/**
 * Update a buyer's status via PATCH /api/v1/admin/buyers/{id}/status
 */
export async function updateBuyerStatus(id: string, status: string): Promise<unknown> {
  const response = await api.patch(`/admin/buyers/${id}/status`, { status });
  return response.data;
}

/**
 * Update a buyer via PUT /api/v1/admin/buyers/{id}
 */
export async function updateBuyer(
  id: string,
  payload: UpdateBuyerPayload
): Promise<AdminBuyerDetailResponse> {
  const response = await api.put(`/admin/buyers/${id}`, payload);
  const data = response.data;
  return data?.data || data;
}

/**
 * Delete a buyer via DELETE /api/v1/admin/buyers/{id}
 */
export async function deleteBuyer(id: string): Promise<void> {
  await api.delete(`/admin/buyers/${id}`);
}

/**
 * Create a buyer via POST /api/v1/admin/buyers
 */
export async function createBuyer(
  payload: CreateBuyerPayload
): Promise<AdminBuyerDetailResponse> {
  const response = await api.post('/admin/buyers', payload);
  const data = response.data;
  return data?.data || data;
}

/**
 * Activate / verify a pending buyer.
 * TODO: backend endpoint not finalised yet — confirm the real path & method.
 * Best guess: POST /api/v1/admin/buyers/{id}/verify
 */
export async function verifyBuyer(id: string): Promise<unknown> {
  const response = await api.post(`/admin/buyers/${id}/verify`);
  return response.data;
}

