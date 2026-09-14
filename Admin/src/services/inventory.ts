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

/** Filters accepted by the export endpoint (same as the search filters, without pagination). */
export type InventoryExportQuery = Omit<
  ListAdminInventoryQuery,
  'pageNum' | 'pageSize'
>;

export interface InventoryExportFile {
  blob: Blob;
  filename: string;
}

export interface InventoryImportRowError {
  row?: number;
  sku?: string;
  message: string;
}

/** Best-effort shape of the import summary; extra backend fields are preserved. */
export interface ImportInventoryResult {
  total?: number;
  imported?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
  errors?: InventoryImportRowError[];
  [key: string]: unknown;
}

export const getAdminInventory = async (
  query: ListAdminInventoryQuery
): Promise<PaginatedAdminVariantStock> => {
  try {
    const { data } = await api.post('/admin/inventory/variants/search', query);
    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as { data: PaginatedAdminVariantStock }).data
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
          ? (data as { data: PaginatedAdminVariantStock }).data
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

/** Pulls the file name out of a Content-Disposition header, RFC 5987 aware. */
const parseFilenameFromDisposition = (
  header: string | undefined,
  fallback: string
): string => {
  if (!header) return fallback;
  const utf8Match = /filename\*=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const asciiMatch = /filename=["']?([^"';]+)["']?/i.exec(header);
  return asciiMatch?.[1] || fallback;
};

/**
 * When a blob request fails, the error payload is itself a Blob. Decode it back
 * to JSON so handleServiceError can surface a real message.
 */
const decodeBlobError = async (err: unknown): Promise<unknown> => {
  const response = (err as { response?: { data?: unknown } })?.response;
  if (response?.data instanceof Blob) {
    try {
      const text = await response.data.text();
      response.data = text ? JSON.parse(text) : undefined;
    } catch {
      // Leave the original error untouched if it isn't JSON.
    }
  }
  return err;
};

/**
 * GET /admin/inventory/export — downloads the inventory as a file (Excel/CSV).
 * Pass the current filters to export only what is visible.
 */
export const exportAdminInventory = async (
  query: InventoryExportQuery = {}
): Promise<InventoryExportFile> => {
  try {
    const response = await api.get('/admin/inventory/export', {
      params: query,
      responseType: 'blob',
    });
    const filename = parseFilenameFromDisposition(
      response.headers?.['content-disposition'] as string | undefined,
      `inventory-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    return { blob: response.data as Blob, filename };
  } catch (err) {
    throw handleServiceError(
      await decodeBlobError(err),
      'Failed to export inventory'
    );
  }
};

/**
 * Browser-only helper: saves a fetched export file to disk.
 * Call from a click handler, e.g.
 *   downloadInventoryExport(await exportAdminInventory({ search, stockStatus }));
 */
export const downloadInventoryExport = ({
  blob,
  filename,
}: InventoryExportFile): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const unwrapImportResult = (data: unknown): ImportInventoryResult => {
  const unwrapped =
    data && typeof data === 'object' && 'success' in data && 'data' in data
      ? (data as { data: ImportInventoryResult }).data
      : data;
  return (unwrapped ?? {}) as ImportInventoryResult;
};

/**
 * POST /admin/inventory/import — uploads a spreadsheet to bulk-import stock.
 * Sends multipart/form-data with the file under the `file` field.
 * Falls back to the vendor endpoint if the admin one is unavailable.
 */
export const importAdminInventory = async (
  file: File
): Promise<ImportInventoryResult> => {
  const buildForm = () => {
    const fd = new FormData();
    fd.append('file', file);
    return fd;
  };

  try {
    const { data } = await api.post(
      '/admin/inventory/import',
      buildForm(),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrapImportResult(data);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    // Only retry the vendor route when the admin route is missing (404) or not allowed (405)
    if (status === 404 || status === 405) {
      try {
        const { data } = await api.post(
          '/vendor/inventory/import',
          buildForm(),
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return unwrapImportResult(data);
      } catch {
        // fall through to throw the original error
      }
    }
    throw handleServiceError(err, 'Failed to import inventory');
  }
};
