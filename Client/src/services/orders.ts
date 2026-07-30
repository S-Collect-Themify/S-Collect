import { api, handleServiceError } from './api';
import type {
  PaginatedSubOrders,
  SubOrder,
  SubOrderStatus,
  UpdateSubOrderDto,
} from '../features/Orders/types/subOrder';

// Helper: some API responses are wrapped as { success, data: <payload>, meta }
// while others return the payload directly. This unwraps both shapes.
const unwrap = <T>(res: any): T => {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return res.data as T;
  }
  return res as T;
};

export const getSubOrders = async (params?: {
  pageNum?: number;
  pageSize?: number;
  status?: SubOrderStatus;
}): Promise<PaginatedSubOrders> => {
  try {
    const { data } = await api.get('/vendor/sub-orders', { params });
    return unwrap<PaginatedSubOrders>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch sub-orders');
  }
};

export const getSubOrderById = async (id: string): Promise<SubOrder> => {
  try {
    const { data } = await api.get(`/vendor/sub-orders/${id}`);
    return unwrap<SubOrder>(data);
  } catch (err) {
    throw handleServiceError(err, `Failed to fetch sub-order ${id}`);
  }
};

export interface VendorOrderStats {
  totalSales: number;
  totalOrders: number;
  newOrders: number;
  activeProducts: number;
  productCount?: number;
  orderCount?: number;
  pendingPayouts?: number;
  totalDues?: number;
}

export const getVendorOrderStats = async (): Promise<VendorOrderStats> => {
  try {
    const { data } = await api.get('/vendor/sub-orders/stats');
    const raw = unwrap<any>(data);
    return {
      totalSales: raw.totalSales ?? 0,
      totalOrders: raw.totalOrders ?? raw.orderCount ?? 0,
      newOrders: raw.newOrders ?? 0,
      activeProducts: raw.activeProducts ?? raw.productCount ?? 0,
      productCount: raw.productCount ?? raw.activeProducts ?? 0,
      orderCount: raw.orderCount ?? raw.totalOrders ?? 0,
      pendingPayouts: raw.pendingPayouts ?? 0,
      totalDues: raw.totalDues ?? raw.pendingPayouts ?? 0,
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor order stats');
  }
};

export const updateSubOrder = async (
  id: string,
  body: UpdateSubOrderDto
): Promise<SubOrder> => {
  try {
    const { data } = await api.patch(`/vendor/sub-orders/${id}`, body);
    return unwrap<SubOrder>(data);
  } catch (err) {
    throw handleServiceError(err, `Failed to update sub-order ${id}`);
  }
};
