import { api, handleServiceError } from './api';

export type InventoryStockStatus = 'inStock' | 'lowStock' | 'outOfStock';

export interface ListVendorInventoryQuery {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  minStock?: number;
  maxStock?: number;
  stockStatus?: InventoryStockStatus | string;
}

export interface VendorVariantStockItem {
  variantId: string;
  productId: string;
  productName: string;
  productNameAr: string;
  labelName?: string | Record<string, any> | null;
  labelNameAr?: string | Record<string, any> | null;
  sku: string;
  stock: number;
  thumbnailUrl?: string | Record<string, any> | null;
  lastUpdatedAt: string;
  isLowStock?: boolean;
}

export interface PaginatedVendorVariantStock {
  items: VendorVariantStockItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage?: number;
    pageSize?: number;
    page?: number;
    limit?: number;
  };
}

export interface BulkUpdateVariantStockItem {
  variantId: string;
  stock: number;
}

export interface BulkUpdateVariantStockParams {
  updates: BulkUpdateVariantStockItem[];
}

export interface InventoryImportFailedItem {
  row: number;
  variantId?: string;
  sku?: string;
  reason: string;
}

export interface InventoryImportResponse {
  updated: number;
  failed: InventoryImportFailedItem[];
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
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: query.pageSize || 50,
          page: 1,
          limit: query.pageSize || 50,
        },
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
 * Downloads the official Excel sheet of all vendor variants with their current stock levels.
 * The Stock column is highlighted yellow with SUM header formulas for editing and re-upload.
 */
export const exportVendorInventory = async (): Promise<Blob> => {
  try {
    const response = await api.get('/vendor/inventory/export', {
      responseType: 'blob',
    });

    const contentType =
      (response.headers['content-type'] as string) ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blob = new Blob([response.data as BlobPart], {
      type: contentType,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `inventory_stock_export_${dateStr}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (err) {
    throw handleServiceError(err, 'Failed to export inventory');
  }
};

/**
 * Uploads a previously exported inventory Excel sheet to bulk-update variant stock.
 */
export const importVendorInventory = async (
  file: File
): Promise<InventoryImportResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/vendor/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const unwrapped: InventoryImportResponse =
      data && typeof data === 'object' && 'data' in data
        ? (data as any).data
        : data;

    return unwrapped;
  } catch (err) {
    throw handleServiceError(err, 'Failed to import inventory');
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

    const totalPages =
      firstPage.pagination?.totalPages ||
      (firstPage.pagination?.totalItems
        ? Math.ceil(firstPage.pagination.totalItems / pageSize)
        : 1);
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

