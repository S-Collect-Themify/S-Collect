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
  address?: unknown;
  jointDate?: string;
  savedAddresses?: AdminSavedAddress[];
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

