import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAdminBuyers,
  getAdminBuyerDetail,
  type BuyerQueryParams,
  type AdminBuyerDetailResponse,
} from '../../../services/buyers';
import type { Buyer } from '../types/buyers';
import {
  formatBuyerName,
  formatBuyerDate,
  formatOrderCount,
} from '../utils/buyerUtils';

export function mapBackendBuyerToBuyer(item: any): Buyer {
  if (!item || typeof item !== 'object') {
    return {
      id: '---',
      name: '---',
      email: '---',
      phoneNumber: '---',
      date: '---',
      ordersNum: '---',
      status: '---',
    };
  }

  const name = formatBuyerName(
    item.firstName || item.name || item.fullName,
    item.lastName
  );
  const email = (typeof item.email === 'string' ? item.email : item.email?.address)?.trim() || '---';
  const phoneNumber = (typeof item.phoneNumber === 'string' ? item.phoneNumber : item.phone)?.trim() || '---';
  const date = formatBuyerDate(item.createdAt || item.date || item.created_at);
  const ordersNum = formatOrderCount(item.totalOrders ?? item.ordersNum ?? item.ordersCount);
  const status = (item.status || '').trim() || '---';
  const id = item.id || item._id ? String(item.id || item._id) : '---';

  return {
    id,
    name,
    firstName: item.firstName || undefined,
    lastName: item.lastName || undefined,
    email,
    phoneNumber,
    date,
    ordersNum,
    status,
    createdAt: item.createdAt || undefined,
  };
}

export function extractBuyersPayload(resData: any): { items: any[]; pagination: any } {
  if (!resData) {
    return { items: [], pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 } };
  }

  let target = resData;

  // Handle standard API wrapper { success: true, data: { items: [...], pagination: {...} } }
  if (target && typeof target === 'object' && 'data' in target && target.data) {
    const d = target.data;
    if (
      Array.isArray(d) ||
      (typeof d === 'object' && (d.items || d.buyers || d.pagination || d.data))
    ) {
      target = d;
    }
  }

  let items: any[] = [];
  if (Array.isArray(target)) {
    items = target;
  } else if (Array.isArray(target?.items)) {
    items = target.items;
  } else if (Array.isArray(target?.buyers)) {
    items = target.buyers;
  } else if (Array.isArray(target?.data)) {
    items = target.data;
  }

  const pagination = target?.pagination || resData?.pagination || {
    currentPage: 1,
    pageSize: 25,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / 25) || (items.length > 0 ? 1 : 0),
  };

  return { items, pagination };
}

export function useAdminBuyers(params: BuyerQueryParams) {
  return useQuery({
    queryKey: ['admin-buyers', params],
    queryFn: () => getAdminBuyers(params),
    select: (resData) => {
      const { items, pagination } = extractBuyersPayload(resData);
      return {
        items: items.map(mapBackendBuyerToBuyer),
        pagination: {
          currentPage: Number(pagination?.currentPage ?? params.pageNum ?? 1),
          pageSize: Number(pagination?.pageSize ?? params.pageSize ?? 25),
          totalItems: Number(pagination?.totalItems ?? items.length),
          totalPages: Number(pagination?.totalPages ?? (items.length > 0 ? 1 : 0)),
        },
      };
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function mapAdminBuyerDetailToBuyer(data?: AdminBuyerDetailResponse | null): Buyer {
  if (!data) {
    return {
      id: '---',
      name: '---',
      email: '---',
      phoneNumber: '---',
      date: '---',
      ordersNum: '---',
      status: '---',
      totalSpent: '---',
      avgOrderValue: '---',
      lastActive: '---',
      location: '---',
    };
  }

  const nameParts = [data.firstName, data.lastName].filter(Boolean);
  const name = nameParts.length > 0 ? nameParts.join(' ') : '---';

  const email = data.email?.trim() || '---';

  const date = data.jointDate ? formatBuyerDate(data.jointDate) : '---';

  const defaultAddr = data.savedAddresses?.find((a) => a.isDefault) || data.savedAddresses?.[0];
  const locParts = [defaultAddr?.city, defaultAddr?.zone?.nameEn || defaultAddr?.zone?.code].filter(Boolean);
  const location = locParts.length > 0 ? locParts.join(', ') : '---';

  return {
    id: data.id || '---',
    name,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    email,
    phoneNumber: '---',
    date,
    ordersNum: '---',
    status: '---',
    totalSpent: '---',
    avgOrderValue: '---',
    lastActive: '---',
    location,
  };
}

export function useAdminBuyerDetail(id?: string) {
  return useQuery({
    queryKey: ['admin-buyer-detail', id],
    queryFn: () => getAdminBuyerDetail(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    select: mapAdminBuyerDetailToBuyer,
  });
}
