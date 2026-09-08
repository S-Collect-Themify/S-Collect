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
    if (!unwrapped) {
      return {
        items: [],
        pagination: { totalItems: 0, totalPages: 0, page: 1, limit: query.pageSize || 50 },
      };
    }
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

/**
 * Fetches all inventory variants across all pages for full inventory export
 */
export const fetchAllVendorInventoryVariants = async (
  query?: Omit<ListVendorInventoryQuery, 'pageNum' | 'pageSize'>
): Promise<VendorVariantStockItem[]> => {
  try {
    const pageSize = 100;
    const firstPage = await getVendorInventory({
      ...query,
      pageNum: 1,
      pageSize,
    });

    const totalPages = firstPage.pagination?.totalPages || 1;
    let allItems = [...(firstPage.items || [])];

    if (totalPages > 1) {
      const remainingPagePromises: Promise<PaginatedVendorVariantStock>[] = [];
      for (let page = 2; page <= totalPages; page++) {
        remainingPagePromises.push(
          getVendorInventory({
            ...query,
            pageNum: page,
            pageSize,
          })
        );
      }

      const results = await Promise.all(remainingPagePromises);
      results.forEach((res) => {
        if (res.items && res.items.length > 0) {
          allItems = allItems.concat(res.items);
        }
      });
    }

    return allItems;
  } catch (err) {
    throw handleServiceError(
      err,
      'Failed to fetch all inventory variants for export'
    );
  }
};
