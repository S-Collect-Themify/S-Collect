export interface VendorNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  data?: Record<string, unknown> | null;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedVendorNotifications {
  items: VendorNotification[];
  pagination: PaginationMeta;
}

export interface GetNotificationsParams {
  pageNum?: number;
  pageSize?: number;
}

export type NotificationFilter = 'all' | 'unread';
