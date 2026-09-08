import { api, handleServiceError } from './api';

export interface ListAdminInventoryQuery {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  vendorId?: string;
  minStock?: number;
  maxStock?: number;
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock';
}

export interface AdminVariantStockItem {
  variantId: string;
  productId: string;
  productName: string;
  productNameAr: string;
  labelName: string | null;
  labelNameAr: string | null;
  sku: string;
  stock: number;
  thumbnailUrl?: string | null;
  lastUpdatedAt: string;
  isLowStock?: boolean;
  vendorId?: string;
  storeName?: string;
  storeNameAr?: string | null;
}

export interface PaginatedAdminVariantStock {
  items: AdminVariantStockItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface BulkUpdateVariantStockParams {
  updates: {
    variantId: string;
    stock: number;
  }[];
}

export const getAdminInventory = async (
  query: ListAdminInventoryQuery
): Promise<PaginatedAdminVariantStock> => {
  try {
    const { data } = await api.post('/admin/inventory/variants/search', query);
    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;
    if (!unwrapped) {
      return {
        items: [],
        pagination: { totalItems: 0, totalPages: 0, page: 1, limit: query.pageSize || 8 },
      };
    }
    return unwrapped;
  } catch (err) {
    // Fallback to vendor inventory endpoint if admin endpoint is unavailable
    try {
      const { data } = await api.post('/vendor/inventory/variants/search', query);
      const unwrapped =
        data && typeof data === 'object' && 'success' in data && 'data' in data
          ? (data as any).data
          : data;
      if (unwrapped) return unwrapped;
    } catch {
      // Ignore fallback failure and throw original error
    }
    throw handleServiceError(err, 'Failed to fetch inventory');
  }
};

export const bulkUpdateVariantStock = async (
  params: BulkUpdateVariantStockParams
): Promise<void> => {
  try {
    const { data } = await api.post(
      '/vendor/inventory/variants/bulk-stock',
      params
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to bulk update inventory stock');
  }
};
