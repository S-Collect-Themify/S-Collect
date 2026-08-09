import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAdminBuyers,
  getAdminBuyerDetail,
  getAdminBuyerStats,
  type BuyerQueryParams,
  type AdminBuyerDetailResponse,
} from '../../../services/buyers';
import type { Buyer } from '../types/buyers';
import {
  formatBuyerName,
  formatBuyerDate,
  formatOrderCount,
} from '../utils/buyerUtils';

export function mapBackendBuyerToBuyer(raw: unknown): Buyer {
  if (!raw || typeof raw !== 'object') {
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

  const item = raw as Record<string, unknown>;

  const firstNameStr = typeof item.firstName === 'string' ? item.firstName : undefined;
  const lastNameStr = typeof item.lastName === 'string' ? item.lastName : undefined;
  const nameStr = typeof item.name === 'string' ? item.name : undefined;
  const fullNameStr = typeof item.fullName === 'string' ? item.fullName : undefined;

  const name = formatBuyerName(firstNameStr || nameStr || fullNameStr, lastNameStr);

  const emailObj = typeof item.email === 'object' && item.email !== null ? (item.email as Record<string, unknown>) : null;
  const email = (typeof item.email === 'string' ? item.email : typeof emailObj?.address === 'string' ? emailObj.address : '')?.trim() || '---';

  const phoneNumber = (typeof item.phoneNumber === 'string' ? item.phoneNumber : typeof item.phone === 'string' ? item.phone : '')?.trim() || '---';

  const createdAtStr = typeof item.createdAt === 'string' ? item.createdAt : typeof item.created_at === 'string' ? item.created_at : typeof item.date === 'string' ? item.date : undefined;
  const date = formatBuyerDate(createdAtStr);

  const ordersCountVal = typeof item.totalOrders === 'number' ? item.totalOrders : typeof item.ordersNum === 'number' ? item.ordersNum : typeof item.ordersCount === 'number' ? item.ordersCount : undefined;
  const ordersNum = formatOrderCount(ordersCountVal);

  const status = (typeof item.status === 'string' ? item.status : '').trim() || '---';
  const id = item.id || item._id ? String(item.id || item._id) : '---';

  return {
    id,
    name,
    firstName: firstNameStr,
    lastName: lastNameStr,
    email,
    phoneNumber,
    date,
    ordersNum,
    status,
    createdAt: createdAtStr,
  };
}

export function extractBuyersPayload(resData: unknown): { items: Record<string, unknown>[]; pagination: Record<string, unknown> } {
  if (!resData || typeof resData !== 'object') {
    return { items: [], pagination: { currentPage: 1, pageSize: 25, totalItems: 0, totalPages: 0 } };
  }

  const resObj = resData as Record<string, unknown>;
  let target: Record<string, unknown> = resObj;

  if (resObj.data && typeof resObj.data === 'object') {
    const d = resObj.data as Record<string, unknown>;
    if (Array.isArray(d) || d.items || d.buyers || d.pagination || d.data) {
      target = d;
    }
  }

  let items: Record<string, unknown>[] = [];
  if (Array.isArray(target)) {
    items = target as Record<string, unknown>[];
  } else if (Array.isArray(target?.items)) {
    items = target.items as Record<string, unknown>[];
  } else if (Array.isArray(target?.buyers)) {
    items = target.buyers as Record<string, unknown>[];
  } else if (Array.isArray(target?.data)) {
    items = target.data as Record<string, unknown>[];
  }

  const paginationObj = (target?.pagination || resObj?.pagination || {}) as Record<string, unknown>;
  const pagination = {
    currentPage: 1,
    pageSize: 25,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / 25) || (items.length > 0 ? 1 : 0),
    ...paginationObj,
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

export function useAdminBuyerStats(id?: string) {
  return useQuery({
    queryKey: ['admin-buyer-stats', id],
    queryFn: () => getAdminBuyerStats(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
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
