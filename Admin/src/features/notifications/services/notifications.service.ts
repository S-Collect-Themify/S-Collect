import { api, handleServiceError } from '../../../services/api';
import type { AdminNotification, GetNotificationsResponse } from '../types/notification.types';

let MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: '1',
    title: 'Test Notification Title',
    message: 'Test Notification Message => Fixed MSG',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'order',
  },
    {
    id: '2',
    title: 'New Admin has added successfully',
    message: 'New Admin has been added successfully to the system.',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'order',
  }
];

export const notificationsService = {
  async getNotifications(): Promise<GetNotificationsResponse> {
    try {
      const response = await api.get<GetNotificationsResponse | AdminNotification[]>('/admin/notifications');
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          notifications: data,
          unreadCount: data.filter((n) => !n.isRead).length,
        };
      }
      if (data && Array.isArray(data.notifications)) {
        return {
          notifications: data.notifications,
          unreadCount: data.unreadCount ?? data.notifications.filter((n) => !n.isRead).length,
        };
      }
      return {
        notifications: MOCK_NOTIFICATIONS,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
      };
    } catch {
      // Fallback gracefully to mock data when backend endpoint is not implemented yet
      return {
        notifications: MOCK_NOTIFICATIONS,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
      };
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    try {
      await api.patch(`/admin/notifications/${notificationId}/read`);
    } catch (error) {
      // Log for debugging if API endpoint is active
      console.warn('[Notifications] Could not sync markAsRead to backend:', handleServiceError(error).message);
    }
  },

  async clearAll(): Promise<void> {
    MOCK_NOTIFICATIONS = [];
    try {
      await api.delete('/admin/notifications');
    } catch (error) {
      console.warn('[Notifications] Could not sync clearAll to backend:', handleServiceError(error).message);
    }
  },
};
