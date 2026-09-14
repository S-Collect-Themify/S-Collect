export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: 'order' | 'system' | 'vendor' | 'inventory' | 'payout';
  link?: string;
}

export interface GetNotificationsResponse {
  notifications: AdminNotification[];
  unreadCount: number;
}
