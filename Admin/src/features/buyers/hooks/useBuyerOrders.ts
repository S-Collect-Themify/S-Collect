import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAdminOrders, type AdminOrderItem } from '../../../services/orders';
import { formatBuyerDate } from '../utils/buyerUtils';

export interface BuyerOrderDisplayItem {
  id: string;
  rawId: string;
  orderNumber: string;
  products: string;
  date: string;
  amount: number | string;
  status: string;
  raw: AdminOrderItem;
}

export function mapAdminOrderItemToBuyerOrder(item: AdminOrderItem): BuyerOrderDisplayItem {
  const rawId = item.id || '---';
  const displayId = item.id ? (item.id.startsWith('#') ? item.id : `#${item.id}`) : '---';

  // Extract product names from subOrders -> items
  const productNames: string[] = [];
  if (Array.isArray(item.subOrders)) {
    for (const sub of item.subOrders) {
      if (Array.isArray(sub.items)) {
        for (const line of sub.items) {
          if (line.productName) {
            const qtyStr = line.quantity > 1 ? ` x${line.quantity}` : '';
            productNames.push(`${line.productName}${qtyStr}`);
          }
        }
      }
    }
  }

  const productsStr = productNames.length > 0 ? productNames.join(', ') : '---';
  const dateStr = formatBuyerDate(item.createdAt);
  const grandTotal = item.grandTotalAmount ?? item.subtotalAmount ?? '---';
  const statusStr = item.overallStatus || item.paymentStatus || '---';

  return {
    id: displayId,
    rawId,
    orderNumber: displayId,
    products: productsStr,
    date: dateStr,
    amount: grandTotal,
    status: statusStr,
    raw: item,
  };
}

export function useBuyerOrders(buyerAccountId: string, pageNum = 1, pageSize = 25) {
  return useQuery({
    queryKey: ['buyer-orders', buyerAccountId, pageNum, pageSize],
    queryFn: () => getAdminOrders({ buyerAccountId, pageNum, pageSize }),
    enabled: Boolean(buyerAccountId && buyerAccountId.trim() && buyerAccountId !== '---'),
    select: (res) => {
      const items = (res.items || []).map(mapAdminOrderItemToBuyerOrder);
      const pagination = res.pagination || {
        currentPage: pageNum,
        pageSize,
        totalItems: items.length,
        totalPages: items.length > 0 ? 1 : 0,
      };
      return { items, pagination };
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
