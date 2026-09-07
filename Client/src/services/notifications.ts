import { api, handleServiceError } from './api';
import type {
  GetNotificationsParams,
  PaginatedVendorNotifications,
} from '../features/notifications/types';

// Helper: safe unwrap for standard API envelope { success: true, data: ... } or raw payload
const unwrap = <T>(res: unknown): T => {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * Fetch vendor notifications with optional pagination
 * GET /api/v1/vendor/notifications
 */
export const getVendorNotifications = async (
  params?: GetNotificationsParams
): Promise<PaginatedVendorNotifications> => {
  try {
    const { data } = await api.get('/vendor/notifications', {
      params: {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 25,
      },
    });
    const payload = unwrap<PaginatedVendorNotifications>(data);
    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: payload?.pagination || {
        currentPage: 1,
        pageSize: params?.pageSize ?? 25,
        totalItems: Array.isArray(payload?.items) ? payload.items.length : 0,
        totalPages: 1,
      },
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor notifications');
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/v1/vendor/notifications/{id}/read
 */
export const markVendorNotificationRead = async (id: string): Promise<void> => {
  try {
    await api.patch(`/vendor/notifications/${id}/read`);
  } catch (err) {
    throw handleServiceError(err, `Failed to mark notification ${id} as read`);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/v1/vendor/notifications/read-all
 */
export const markAllVendorNotificationsRead = async (): Promise<void> => {
  try {
    await api.patch('/vendor/notifications/read-all');
  } catch (err) {
    throw handleServiceError(err, 'Failed to mark all notifications as read');
  }
};
