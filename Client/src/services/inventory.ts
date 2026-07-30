import { api, handleServiceError } from './api';

export interface ListVendorInventoryQuery {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  minStock?: number;
  maxStock?: number;
}

export interface VendorVariantStockItem {
  variantId: string;
  productId: string;
  productName: string;
  productNameAr: string;
  labelName: string | null;
  labelNameAr: string | null;
  sku: string;
  stock: number;
  lastUpdatedAt: string;
}

export interface PaginatedVendorVariantStock {
  items: VendorVariantStockItem[];
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

export const getVendorInventory = async (
  query: ListVendorInventoryQuery
): Promise<PaginatedVendorVariantStock> => {
  try {
    const { data } = await api.post('/vendor/inventory/variants/search', query);
    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;
    return unwrapped;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor inventory');
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
