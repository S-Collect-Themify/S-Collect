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

export async function getAdminBuyers(params: BuyerQueryParams): Promise<any> {
  const cleanParams: Record<string, any> = {};

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
