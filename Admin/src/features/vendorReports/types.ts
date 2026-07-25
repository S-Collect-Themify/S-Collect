export type DateRangeKey = 'last7Days' | 'last30Days' | 'thisMonth' | 'thisYear';

export interface DateRangeOption {
  key: DateRangeKey;
  defaultLabel: string;
}

export type OrderStatus = 'delivered' | 'processing' | 'canceled' | 'shipped';

export interface DetailedOrder {
  id: string;
  date: string;
  amount: number;
  commission: number;
  net: number;
  status: OrderStatus;
}

export interface ReportStatCardData {
  id: string;
  titleKey: string;
  defaultTitle: string;
  value: string;
  currency: string;
  iconName: 'gmv' | 'commission' | 'payouts' | 'net' | 'pending';
  rateBadge?: string;
  trend?: string;
  trendDirection?: 'down' | 'up';
  alertBadgeKey?: string;
  alertBadgeDefault?: string;
  alertBadgeType?: 'amber' | 'blue' | 'green';
}
