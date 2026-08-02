import { api } from './api';

// ─── Rate Normalization Helpers ──────────────────────────────────────────

/**
 * Normalizes a rate received from the API (decimal 0-1 or percentage 0-100)
 * to a UI percentage number (0-100). E.g., 0.12 -> 12, 0.15 -> 15.
 */
export function normalizeRateFromApi(rate: number): number {
  if (typeof rate !== 'number' || isNaN(rate)) return 0;
  if (rate > 0 && rate <= 1) {
    return Number((rate * 100).toFixed(2));
  }
  return rate;
}

/**
 * Normalizes a rate entered in the UI (percentage 0-100)
 * to an API decimal rate (0-1). E.g., 12 -> 0.12, 15 -> 0.15.
 */
export function normalizeRateToApi(rate: number): number {
  if (typeof rate !== 'number' || isNaN(rate)) return 0;
  if (rate > 1) {
    return Number((rate / 100).toFixed(4));
  }
  return rate;
}

// ─── Platform Commission ───────────────────────────────────────────────

export interface PlatformCommissionResponse {
  rate: number;
  updatedAt: string;
}

/**
 * GET /api/v1/admin/commission-settings
 */
export async function getPlatformCommission(): Promise<PlatformCommissionResponse> {
  const { data } = await api.get('/admin/commission-settings');
  const payload: PlatformCommissionResponse =
    data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
  const rawRate = typeof payload?.rate === 'number' ? payload.rate : parseFloat(payload?.rate as string) || 0;
  return {
    rate: normalizeRateFromApi(rawRate),
    updatedAt: payload?.updatedAt ?? '',
  };
}

/**
 * PUT /api/v1/admin/commission-settings
 */
export async function updatePlatformCommission(rate: number): Promise<PlatformCommissionResponse> {
  const apiRate = normalizeRateToApi(rate);
  const { data } = await api.put('/admin/commission-settings', { rate: apiRate });
  const payload: PlatformCommissionResponse =
    data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
  const rawRate = typeof payload?.rate === 'number' ? payload.rate : parseFloat(payload?.rate as string) || rate;
  return {
    rate: normalizeRateFromApi(rawRate),
    updatedAt: payload?.updatedAt ?? new Date().toISOString(),
  };
}

// ─── Vendor Commission ─────────────────────────────────────────────────

/**
 * GET /api/v1/admin/vendors/{vendorId}/commission
 */
export async function getVendorCommission(vendorId: string): Promise<number | null> {
  try {
    const { data } = await api.get(`/admin/vendors/${vendorId}/commission`);
    const payload = data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    if (!payload || typeof payload.rate === 'undefined' || payload.rate === null) return null;
    const rawRate = typeof payload.rate === 'number' ? payload.rate : parseFloat(payload.rate as string) || 0;
    return normalizeRateFromApi(rawRate);
  } catch {
    return null;
  }
}

/**
 * PUT /api/v1/admin/vendors/{id}/commission
 */
export async function setVendorCommission(vendorId: string, rate: number): Promise<void> {
  const apiRate = normalizeRateToApi(rate);
  await api.put(`/admin/vendors/${vendorId}/commission`, { rate: apiRate });
}

/**
 * DELETE /api/v1/admin/vendors/{id}/commission
 * Resets vendor to platform default rate.
 */
export async function deleteVendorCommission(vendorId: string): Promise<void> {
  await api.delete(`/admin/vendors/${vendorId}/commission`);
}

// ─── Category Commission ───────────────────────────────────────────────

export interface CategoryCommissionResponse {
  categoryId: string;
  rate: number;
  updatedAt: string;
}

/**
 * GET /api/v1/admin/categories/{categoryId}/commission
 */
export async function getCategoryCommission(
  categoryId: string
): Promise<CategoryCommissionResponse | null> {
  try {
    const { data } = await api.get(`/admin/categories/${categoryId}/commission`);
    const payload: CategoryCommissionResponse =
      data && typeof data === 'object' && 'data' in data && data.data ? data.data : data;
    if (!payload || typeof payload.rate === 'undefined' || payload.rate === null) return null;
    const rawRate = typeof payload.rate === 'number' ? payload.rate : parseFloat(payload.rate as string) || 0;
    return {
      categoryId: payload.categoryId ?? categoryId,
      rate: normalizeRateFromApi(rawRate),
      updatedAt: payload.updatedAt ?? '',
    };
  } catch {
    // 404 means no custom rate set — falls back to platform default
    return null;
  }
}

/**
 * PUT /api/v1/admin/categories/{categoryId}/commission
 */
export async function setCategoryCommission(categoryId: string, rate: number): Promise<void> {
  const apiRate = normalizeRateToApi(rate);
  await api.put(`/admin/categories/${categoryId}/commission`, { rate: apiRate });
}

/**
 * DELETE /api/v1/admin/categories/{categoryId}/commission
 * Resets category to platform default rate.
 */
export async function deleteCategoryCommission(categoryId: string): Promise<void> {
  await api.delete(`/admin/categories/${categoryId}/commission`);
}

