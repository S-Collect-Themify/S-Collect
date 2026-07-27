import { api, handleServiceError } from './api';

export interface VendorSubOrderItem {
  id: string;
  orderId: string;
  vendorId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingRateApplied: number;
  trackingNumber?: string | null;
  statusOverrideReason?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId?: string | null;
    productName: string;
    variantLabel?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  createdAt: string;
}

export interface PaginatedSubOrderList {
  items: VendorSubOrderItem[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Fetch vendor sub-orders from backend API
 */
export async function getVendorSubOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedSubOrderList> {
  try {
    const response = await api.get('/vendor/sub-orders', { params });
    return response.data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor sub-orders');
  }
}

/**
 * Fetch a single sub-order details by ID
 */
export async function getVendorSubOrderDetails(
  id: string
): Promise<VendorSubOrderItem> {
  try {
    const response = await api.get(`/vendor/sub-orders/${id}`);
    return response.data;
  } catch (err) {
    throw handleServiceError(
      err,
      `Failed to fetch sub-order details for ${id}`
    );
  }
}

/**
 * Update vendor sub-order status or tracking number
 */
export async function updateVendorSubOrderStatus(
  id: string,
  data: { status: string; trackingNumber?: string }
): Promise<VendorSubOrderItem> {
  try {
    const response = await api.patch(`/vendor/sub-orders/${id}`, data);
    return response.data;
  } catch (err) {
    throw handleServiceError(
      err,
      `Failed to update sub-order status for ${id}`
    );
  }
}
