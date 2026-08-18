// Matches SubOrderWithCommissionResponseDto from the API spec

export type SubOrderStatus =
  'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemWithCommission {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  commissionRateApplied: number;
}

export interface SubOrderCustomer {
  buyerAccountId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface SubOrder {
  id: string;
  orderId: string;
  orderNumber?: number | string | null;
  vendorId: string;
  storeName?: string | null;
  storeNameAr?: string | null;
  status: SubOrderStatus;
  shippingRateApplied: number;
  totalAmount?: number;
  trackingNumber: string | null;
  statusOverrideReason: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: OrderItemWithCommission[];
  customer?: SubOrderCustomer | null;
  createdAt: string;
}

export interface PaginatedSubOrders {
  items: SubOrder[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpdateSubOrderDto {
  trackingNumber?: string;
  status?: SubOrderStatus;
}

// UI display helpers
export const STATUS_STYLES: Record<SubOrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  PROCESSING: 'bg-blue-100 text-blue-600',
  SHIPPED: 'bg-orange-50 text-orange-500',
  DELIVERED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-red-50 text-red-500',
};

export const getOrderStatusLabel = (
  status: SubOrderStatus,
  t: (key: string, options?: { defaultValue?: string }) => string
): string => {
  switch (status) {
    case 'PENDING':
      return t('ordersPage.pending', { defaultValue: 'Pending' });
    case 'PROCESSING':
      return t('ordersPage.processing', { defaultValue: 'Processing' });
    case 'SHIPPED':
      return t('ordersPage.shipped', { defaultValue: 'Shipped' });
    case 'DELIVERED':
      return t('ordersPage.delivered', { defaultValue: 'Delivered' });
    case 'CANCELLED':
      return t('ordersPage.cancelled', { defaultValue: 'Cancelled' });
    default:
      return status;
  }
};

// Valid forward transitions the vendor can make
export const NEXT_STATUS: Partial<Record<SubOrderStatus, SubOrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};
