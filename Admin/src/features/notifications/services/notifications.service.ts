import { api } from '../../../services/api';
import type { AdminNotification, GetNotificationsResponse } from '../types/notification.types';

function normalizeResponse(
  data: GetNotificationsResponse | AdminNotification[]
): GetNotificationsResponse {
  const notifications = Array.isArray(data) ? data : data.notifications ?? [];
  const unreadCount =
    !Array.isArray(data) && typeof data.unreadCount === 'number'
      ? data.unreadCount
      : notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount };
}

export const notificationsService = {
  async getNotifications(): Promise<GetNotificationsResponse> {
    const response = await api.get<GetNotificationsResponse | AdminNotification[]>(
      '/admin/notifications'
    );
    return normalizeResponse(response.data);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/admin/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/admin/notifications/read-all');
  },
};
