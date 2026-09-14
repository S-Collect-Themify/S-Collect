import { api, handleServiceError, ServiceError } from './api';

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
    /** SKU is unused by the real bulk-stock route; kept only so the
     *  export/import fallback below can locate the row to patch. */
    sku: string;
    stock: number;
  }[];
}

/** Outcome of a bulk stock save when some rows could not be applied. */
export interface BulkStockUpdateSummary {
  failed: number;
  errors: InventoryImportRowError[];
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

/** Case/whitespace-insensitive comparison key for matching SKUs and headers. */
const normalizeCell = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const SKU_HEADER_HINTS = ['sku', 'رمز', 'كود'];
const STOCK_HEADER_HINTS = ['stock', 'qty', 'quantity', 'كمية', 'كميه', 'مخزون'];

/** The tiny slice of exceljs's API this fallback needs — kept minimal so we
 *  don't have to import its full type surface for a dynamic `import()`. */
interface MinimalExcelCell {
  value: unknown;
}
interface MinimalExcelRow {
  eachCell(
    opts: { includeEmpty: boolean },
    cb: (cell: MinimalExcelCell, colNumber: number) => void
  ): void;
  getCell(col: number): MinimalExcelCell;
}
interface MinimalExcelWorksheet {
  getRow(rowNumber: number): MinimalExcelRow;
  eachRow(cb: (row: MinimalExcelRow, rowNumber: number) => void): void;
}
interface MinimalExcelJS {
  Workbook: new () => {
    xlsx: {
      load(buffer: ArrayBuffer): Promise<unknown>;
      writeBuffer(): Promise<BlobPart>;
    };
    worksheets: MinimalExcelWorksheet[];
  };
}

/** Finds the single header cell matching one of `hints`; null if none or ambiguous. */
const findHeaderColumn = (headerRow: MinimalExcelRow, hints: string[]): number | null => {
  const matches: number[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const text = normalizeCell(cell.value);
    if (hints.some((hint) => text.includes(hint))) {
      matches.push(colNumber);
    }
  });
  return matches.length === 1 ? matches[0] : null;
};

/**
 * TEMPORARY WORKAROUND — remove once the backend ships a working admin
 * bulk-stock write route (see `bulkUpdateVariantStock` below).
 * Full removal checklist: features/inventory/BULK_STOCK_WORKAROUND_TODO.md
 *
 * There is currently no admin-scoped endpoint to write stock, and the
 * vendor-scoped one rejects admin tokens. Both admin export and admin
 * import are confirmed to work with an admin token, so this downloads the
 * admin's own inventory export, patches just the stock cells for the
 * changed SKUs, and re-uploads it through the admin import endpoint.
 * Heavier than a direct bulk-stock call (a full export/import round trip
 * per save), so it should be dropped as soon as a real route exists.
 */
const bulkUpdateVariantStockViaExportImport = async (
  updates: BulkUpdateVariantStockParams['updates']
): Promise<BulkStockUpdateSummary> => {
  const ExcelModule = await import('exceljs');
  const ExcelJS = (ExcelModule as unknown as { default?: MinimalExcelJS }).default ??
    (ExcelModule as unknown as MinimalExcelJS);

  const { blob } = await exportAdminInventory({});
  const buffer = await blob.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ServiceError('Inventory export returned no sheet to patch.');
  }

  const headerRow = worksheet.getRow(1);
  const skuCol = findHeaderColumn(headerRow, SKU_HEADER_HINTS);
  const stockCol = findHeaderColumn(headerRow, STOCK_HEADER_HINTS);
  if (!skuCol || !stockCol) {
    throw new ServiceError(
      'Could not identify the SKU/stock columns in the inventory export.'
    );
  }

  // Map normalized SKU -> row number so each change is located in one pass.
  const rowNumberBySku = new Map<string, number>();
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const sku = normalizeCell(row.getCell(skuCol).value);
    if (sku) rowNumberBySku.set(sku, rowNumber);
  });

  const errors: InventoryImportRowError[] = [];
  let patchedCount = 0;
  updates.forEach(({ sku, stock, variantId }) => {
    const rowNumber = rowNumberBySku.get(normalizeCell(sku));
    if (!rowNumber) {
      errors.push({
        sku,
        message: `Variant ${variantId} (SKU ${sku || '—'}) was not found in the current export.`,
      });
      return;
    }
    worksheet.getRow(rowNumber).getCell(stockCol).value = stock;
    patchedCount += 1;
  });

  if (patchedCount === 0) {
    throw new ServiceError(
      'None of the changed items could be matched in the inventory export.'
    );
  }

  const outBuffer = await workbook.xlsx.writeBuffer();
  const file = new File(
    [outBuffer],
    `inventory-stock-patch-${Date.now()}.xlsx`,
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );

  const result = await importAdminInventory(file);
  return {
    failed: (Number(result.failed) || 0) + errors.length,
    errors: [...(result.errors || []), ...errors],
  };
};

export const bulkUpdateVariantStock = async (
  params: BulkUpdateVariantStockParams
): Promise<BulkStockUpdateSummary> => {
  try {
    await api.post('/admin/inventory/variants/bulk-stock', {
      updates: params.updates.map(({ variantId, stock }) => ({ variantId, stock })),
    });
    return { failed: 0, errors: [] };
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404 || status === 405) {
      // No admin bulk-stock route exists yet — see the TEMPORARY WORKAROUND
      // note above. Deliberately does not fall back to the vendor route: it
      // rejects admin tokens with 401, which forces a logout redirect.
      try {
        return await bulkUpdateVariantStockViaExportImport(params.updates);
      } catch (fallbackErr) {
        throw handleServiceError(
          fallbackErr,
          'Failed to bulk update inventory stock'
        );
      }
    }
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
