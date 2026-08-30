import { api, handleServiceError } from './api';

export interface VendorPayoutBalance {
  eligibleEarnings: number;
  totalPaidOut: number;
  pendingBalance: number;
}

export interface VendorPayoutRecordedByAdmin {
  firstName?: string | Record<string, unknown> | null;
  lastName?: string | Record<string, unknown> | null;
  email?: string | null;
}

export interface VendorPayoutItem {
  id: string;
  ref: number | string;
  vendorId?: string;
  amount: number;
  isAdjustment: boolean;
  status:
    | 'PENDING'
    | 'PAID'
    | 'PROCESSING'
    | 'FAILED'
    | 'REJECTED'
    | 'CANCELLED'
    | string;
  referenceNote?: string | Record<string, unknown> | null;
  transferDate?: string | null;
  recordedByAdminId?: string | null;
  clarifyingNote?: string | Record<string, unknown> | null;
  createdAt: string;
  recordedByAdmin?: VendorPayoutRecordedByAdmin | null;
}

export interface PaginatedPayouts {
  items: VendorPayoutItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PayoutListParams {
  pageNum?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Helper: unwraps response if wrapped in { success, data }
const unwrap = <T>(res: unknown): T => {
  if (
    res &&
    typeof res === 'object' &&
    'data' in res &&
    'success' in res &&
    (res as { success: boolean }).success
  ) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * Fetch vendor payout balance: eligible earnings minus paid out
 */
export const getPayoutBalance = async (): Promise<VendorPayoutBalance> => {
  try {
    const { data } = await api.get('/vendor/payouts/balance');
    const raw = unwrap<Partial<VendorPayoutBalance>>(data);
    return {
      eligibleEarnings: Number(raw?.eligibleEarnings) || 0,
      totalPaidOut: Number(raw?.totalPaidOut) || 0,
      pendingBalance: Number(raw?.pendingBalance) || 0,
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch payout balance');
  }
};

/**
 * Fetch paginated payout history list with optional date range
 */
export const getPayouts = async (
  params?: PayoutListParams
): Promise<PaginatedPayouts> => {
  try {
    const cleanParams: Record<string, string | number> = {};
    if (params?.pageNum !== undefined) cleanParams.pageNum = params.pageNum;
    if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
    if (params?.dateFrom) cleanParams.dateFrom = params.dateFrom;
    if (params?.dateTo) cleanParams.dateTo = params.dateTo;

    const { data } = await api.get('/vendor/payouts', {
      params: cleanParams,
    });
    const raw = unwrap<Partial<PaginatedPayouts>>(data);

    return {
      items: Array.isArray(raw?.items) ? raw.items : [],
      pagination: raw?.pagination || {
        currentPage: params?.pageNum || 1,
        pageSize: params?.pageSize || 25,
        totalItems: Array.isArray(raw?.items) ? raw.items.length : 0,
        totalPages: 1,
      },
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch payouts list');
  }
};

/**
 * Export payout history as an Excel (.xlsx) file and trigger browser download
 */
export const exportPayouts = async (
  params?: PayoutListParams
): Promise<Blob> => {
  try {
    const cleanParams: Record<string, string | number> = {};
    if (params?.pageNum !== undefined) cleanParams.pageNum = params.pageNum;
    if (params?.pageSize !== undefined) cleanParams.pageSize = params.pageSize;
    if (params?.dateFrom) cleanParams.dateFrom = params.dateFrom;
    if (params?.dateTo) cleanParams.dateTo = params.dateTo;

    const response = await api.get('/vendor/payouts/export', {
      params: cleanParams,
      responseType: 'blob',
    });

    const contentType =
      typeof response.headers['content-type'] === 'string'
        ? response.headers['content-type']
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blob = new Blob([response.data as BlobPart], {
      type: contentType,
    });

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `payouts_export_${dateStr}.xlsx`;

    // Trigger browser download
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
    throw handleServiceError(err, 'Failed to export payouts');
  }
};
