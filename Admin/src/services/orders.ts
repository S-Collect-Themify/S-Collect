import { api } from './api';
import i18n from '../i18n';
import type { TransactionItem } from '../features/transactions/types/transaction.types';
import type { TableItem } from '../features/Orders/types';

export interface AdminOrderItem {
  id: string;
  orderNumber?: number;
  buyerAccountId?: string;
  customer?: {
    buyerAccountId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  recipientName?: string;
  recipientPhone?: string;
  shippingZone?: string;
  shippingCity?: string;
  shippingStreetAddress?: string;
  shippingBuildingNumber?: unknown;
  shippingAdditionalDirections?: unknown;
  subtotalAmount?: number;
  shippingTotalAmount?: number;
  grandTotalAmount?: number;
  voucherId?: unknown;
  discountAmount?: number;
  paymentStatus?: string;
  overallStatus?: string;
  paymentMethod?: string;
  fatoorahRef?: string;
  myFatoorahRef?: string;
  vendorName?: string;
  vendorId?: string;
  subOrders?: Array<{
    id: string;
    orderId: string;
    vendorId: string;
    vendorName?: string;
    vendor?: { businessName?: string };
    status: string;
    shippingRateApplied: number;
    trackingNumber?: unknown;
    statusOverrideReason?: unknown;
    shippedAt?: unknown;
    deliveredAt?: unknown;
    items?: Array<{
      id: string;
      productId?: unknown;
      variantId?: unknown;
      productName: string;
      variantLabel?: unknown;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      isRefunded?: boolean;
      commissionRateApplied?: number;
    }>;
    createdAt?: string;
  }>;
  createdAt?: string;
}

export interface AdminOrdersResponse {
  items: AdminOrderItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminOrderDetailItem {
  id: string;
  productId?: unknown;
  variantId?: unknown;
  productName: string;
  variantLabel?: unknown;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isRefunded?: boolean;
  commissionRateApplied?: number;
}

export interface AdminSubOrder {
  id: string;
  orderId: string;
  vendorId: string;
  status: string;
  shippingRateApplied: number;
  trackingNumber?: unknown;
  statusOverrideReason?: unknown;
  shippedAt?: unknown;
  deliveredAt?: unknown;
  items: AdminOrderDetailItem[];
  createdAt: string;
}

export interface AdminOrderDetailResponse {
  id: string;
  orderNumber?: number;
  buyerAccountId?: string;
  customer?: {
    buyerAccountId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  recipientName?: string;
  recipientPhone?: string;
  shippingZone?: string;
  shippingCity?: string;
  shippingStreetAddress?: string;
  shippingBuildingNumber?: unknown;
  shippingAdditionalDirections?: unknown;
  subtotalAmount: number;
  shippingTotalAmount: number;
  grandTotalAmount: number;
  voucherId?: unknown;
  discountAmount: number;
  paymentStatus: string;
  overallStatus: string;
  subOrders: AdminSubOrder[];
  createdAt: string;
}

export interface GetAdminOrdersParams {
  pageNum?: number;
  pageSize?: number;
  buyerAccountId?: string;
  vendorId?: string;
  status?: string;
  search?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  orderNumber?: string;
}

/**
 * Fetch orders list from /api/v1/admin/orders
 */
export async function getAdminOrders(params?: GetAdminOrdersParams): Promise<AdminOrdersResponse> {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 25;

  const cleanParams: Record<string, unknown> = {
    pageNum,
    pageSize,
  };

  if (params?.buyerAccountId) cleanParams.buyerAccountId = params.buyerAccountId;
  if (params?.vendorId) cleanParams.vendorId = params.vendorId;
  if (params?.status && params.status !== 'All' && params.status !== 'all') {
    cleanParams.status = params.status;
  }

  const orderSearchVal = params?.orderNumber || params?.search;
  if (orderSearchVal && orderSearchVal.trim()) {
    const stripped = orderSearchVal.trim().replace(/^(#?ORD-|#)/i, '').trim();
    cleanParams.orderNumber = stripped || orderSearchVal.trim();
  }

  if (params?.dateFrom) {
    cleanParams.dateFrom = params.dateFrom;
  } else if (params?.startDate) {
    cleanParams.dateFrom = params.startDate.split('T')[0];
  }

  if (params?.dateTo) {
    cleanParams.dateTo = params.dateTo;
  } else if (params?.endDate) {
    cleanParams.dateTo = params.endDate.split('T')[0];
  }

  const response = await api.get('/admin/orders', {
    params: cleanParams,
  });

  const resData = response.data;

  let items: AdminOrderItem[] = [];
  let pagination = {
    currentPage: pageNum,
    pageSize,
    totalItems: 0,
    totalPages: 1,
  };

  if (resData) {
    if (Array.isArray(resData.items)) {
      items = resData.items;
      if (resData.pagination) {
        pagination = { ...pagination, ...resData.pagination };
      }
    } else if (resData.data && Array.isArray(resData.data.items)) {
      items = resData.data.items;
      if (resData.data.pagination) {
        pagination = { ...pagination, ...resData.data.pagination };
      }
    } else if (Array.isArray(resData.data)) {
      items = resData.data;
    } else if (Array.isArray(resData)) {
      items = resData;
    }
  }

  return { items, pagination };
}

/**
 * Fetch single order details by ID from /api/v1/admin/orders/{id}
 */
export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetailResponse> {
  const response = await api.get(`/admin/orders/${id}`);
  const data = response.data;
  return data?.data || data;
}

export interface UpdateSubOrderStatusPayload {
  status: string;
  reason?: string;
  trackingNumber?: string;
}

/**
 * Patch sub-order status and tracking number: /api/v1/admin/sub-orders/{id}/status
 */
export async function updateAdminSubOrderStatus(
  subOrderId: string,
  payload: UpdateSubOrderStatusPayload
): Promise<AdminSubOrder> {
  const response = await api.patch(`/admin/sub-orders/${subOrderId}/status`, payload);
  const data = response.data;
  return data?.data || data;
}

export interface GetAdminSubOrdersParams {
  vendorId?: string;
  buyerAccountId?: string;
  pageNum?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  orderNumber?: string;
}

export interface AdminSubOrderItem {
  id: string;
  orderId?: string;
  orderNumber?: number | string;
  vendorId?: string;
  storeName?: string;
  vendorName?: string;
  status?: string;
  shippingRateApplied?: number;
  totalAmount?: number;
  trackingNumber?: string | null;
  statusOverrideReason?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  items?: Array<{
    id?: string;
    productId?: string;
    productName?: string;
    unitPrice?: number;
    quantity?: number;
    lineTotal?: number;
  }>;
  customer?: {
    buyerAccountId?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
}

export interface AdminSubOrdersResponse {
  items: AdminSubOrderItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Fetch sub-orders list GET /api/v1/admin/sub-orders
 * Returns same {items, pagination} shape as getAdminOrders.
 */
export async function getAdminSubOrders(
  params?: GetAdminSubOrdersParams
): Promise<AdminSubOrdersResponse> {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 20;

  try {
    const response = await api.get('/admin/sub-orders', {
      params: {
        vendorId: params?.vendorId,
        buyerAccountId: params?.buyerAccountId,
        buyerId: params?.buyerAccountId,
        pageNum,
        page: pageNum,
        pageSize,
        limit: pageSize,
        perPage: pageSize,
        per_page: pageSize,
        status: params?.status && params.status !== 'All' ? params.status : undefined,
        search: params?.search?.trim() || undefined,
        q: params?.search?.trim() || undefined,
        orderNumber: params?.orderNumber || undefined,
        startDate: params?.startDate,
        endDate: params?.endDate,
        dateFrom: params?.dateFrom || params?.startDate,
        dateTo: params?.dateTo || params?.endDate,
        dateFilter: params?.dateFilter,
      },
    });

    const resData = response.data;
    let items: AdminSubOrderItem[] = [];
    let pagination = {
      currentPage: pageNum,
      pageSize,
      totalItems: 0,
      totalPages: 1,
    };

    if (resData) {
      if (Array.isArray(resData.items)) {
        items = resData.items;
        if (resData.pagination) pagination = { ...pagination, ...resData.pagination };
      } else if (resData.data && Array.isArray(resData.data.items)) {
        items = resData.data.items;
        if (resData.data.pagination) pagination = { ...pagination, ...resData.data.pagination };
      } else if (Array.isArray(resData.data)) {
        items = resData.data;
      } else if (Array.isArray(resData)) {
        items = resData;
      }
    }

    return { items, pagination };
  } catch (err) {
    console.warn('API getAdminSubOrders error:', err);
    return { items: [], pagination: { currentPage: pageNum, pageSize, totalItems: 0, totalPages: 1 } };
  }
}

/**
 * Map API AdminOrderItem object directly preserving paymentStatus field for Transactions page
 */
export function mapAdminOrderToTransactionItem(order: AdminOrderItem): TransactionItem {
  const rawStatus = order.paymentStatus || order.overallStatus || 'PENDING';

  const shortId = order.id ? (order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order.id) : '';
  const orderNo = order.orderNumber ? `#ORD-${order.orderNumber}` : (order.id ? `#ORD-${shortId}` : '---');
  const date = order.createdAt
    ? new Date(order.createdAt).toISOString().split('T')[0]
    : '---';

  const custFirstName = order.customer?.firstName?.trim() || '';
  const custLastName = order.customer?.lastName?.trim() || '';
  const custFullName = `${custFirstName} ${custLastName}`.trim();
  const customerName = custFullName || order.recipientName || '---';

  return {
    id: order.id || Math.random().toString(),
    orderNo,
    date,
    buyerName: customerName,
    amount: order.grandTotalAmount ?? order.subtotalAmount ?? 0,
    paymentMethod: order.paymentMethod || '---',
    status: rawStatus,
    rawPaymentStatus: rawStatus,
    fatoorahRef: order.fatoorahRef || order.myFatoorahRef || '---',
  };
}

/**
 * Map API AdminOrderItem object preserving overallStatus for Orders page
 */
export function mapAdminOrderToTableItem(order: AdminOrderItem): TableItem {
  const shortId = order.id ? (order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order.id) : 'N/A';
  const code = order.orderNumber ? `#ORD-${order.orderNumber}` : `#ORD-${shortId}`;
  const total = order.grandTotalAmount ?? order.subtotalAmount ?? 0;
  const currency = i18n.language === 'ar' ? '﷼' : 'SAR';
  const totalFormatted = `${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  // Use overallStatus from backend for Orders page
  const rawStatus = (order.overallStatus || order.paymentStatus || 'PENDING').toUpperCase();

  const subOrdersCount = order.subOrders ? order.subOrders.length : 0;

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const isAr = i18n.language === 'ar';
  const firstSubOrder = order.subOrders?.[0] as any;
  const vendorNameAr =
    firstSubOrder?.storeNameAr ||
    firstSubOrder?.storeName_ar ||
    firstSubOrder?.vendorNameAr ||
    firstSubOrder?.vendor?.storeNameAr ||
    firstSubOrder?.vendor?.businessNameAr;
  const vendorName = isAr && vendorNameAr
    ? vendorNameAr
    : firstSubOrder?.vendorName ||
      firstSubOrder?.storeName ||
      firstSubOrder?.vendor?.businessName ||
      firstSubOrder?.vendor?.storeName ||
      order.vendorName ||
      '---';
  const vendorId = firstSubOrder?.vendorId || order.vendorId;

  const custFirstName = order.customer?.firstName?.trim() || '';
  const custLastName = order.customer?.lastName?.trim() || '';
  const custFullName = `${custFirstName} ${custLastName}`.trim();
  const customerName = custFullName || order.recipientName || '---';

  return {
    id: order.id,
    code,
    customer: customerName,
    vendor: vendorName,
    vendorId,
    total,
    totalFormatted,
    status: rawStatus,
    subOrdersCount,
    date: dateStr,
    rawCreatedAt: order.createdAt,
  };
}

/**
 * Map a sub-order from /admin/sub-orders into the same TableItem shape as mapAdminOrderToTableItem.
 * Used when the Orders page is filtered by vendorId and fetches from /admin/sub-orders.
 */
export function mapAdminSubOrderToTableItem(sub: AdminSubOrderItem): TableItem {
  const shortId = sub.id ? (sub.id.length > 8 ? sub.id.slice(-6).toUpperCase() : sub.id) : 'N/A';
  const code = sub.orderNumber ? `#SUB-${sub.orderNumber}` : `#SUB-${shortId}`;

  const total = sub.totalAmount ?? sub.items?.reduce((acc, i) => acc + (i.lineTotal ?? 0), 0) ?? 0;
  const isAr = i18n.language === 'ar';
  const currency = isAr ? '﷼' : 'SAR';
  const totalFormatted = `${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  const rawStatus = (sub.status || 'PENDING').toUpperCase();

  const dateStr = sub.createdAt
    ? new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const custFirstName = sub.customer?.firstName?.trim() || '';
  const custLastName = sub.customer?.lastName?.trim() || '';
  const customerName = `${custFirstName} ${custLastName}`.trim() || '---';

  const subAny = sub as any;
  const vendorNameAr =
    subAny.storeNameAr ||
    subAny.storeName_ar ||
    subAny.vendorNameAr ||
    subAny.vendor?.storeNameAr ||
    subAny.vendor?.businessNameAr;
  const vendorName = isAr && vendorNameAr
    ? vendorNameAr
    : sub.storeName || sub.vendorName || '---';

  return {
    id: sub.id,
    code,
    customer: customerName,
    vendor: vendorName,
    vendorId: sub.vendorId,
    total,
    totalFormatted,
    status: rawStatus,
    subOrdersCount: sub.items?.length ?? 0,
    date: dateStr,
    orderId: sub.orderId,
    rawCreatedAt: sub.createdAt,
  };
}
