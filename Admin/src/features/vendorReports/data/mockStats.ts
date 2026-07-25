import type { DateRangeOption, ReportStatCardData } from '../types';

export const DATE_RANGES: DateRangeOption[] = [
  { key: 'last7Days', defaultLabel: 'Last 7 Days' },
  { key: 'last30Days', defaultLabel: 'Last 30 Days' },
  { key: 'thisMonth', defaultLabel: 'This Month' },
  { key: 'thisYear', defaultLabel: 'This Year' },
];

export const STAT_CARDS_DATA: ReportStatCardData[] = [
  {
    id: 'gmv',
    titleKey: 'vendorGmv',
    defaultTitle: 'Vendor GMV',
    value: '14,390',
    currency: 'SAR',
    iconName: 'gmv',
    trend: '18.2%',
    trendDirection: 'down',
  },
  {
    id: 'commission',
    titleKey: 'platformCommission',
    defaultTitle: 'Platform Commission',
    value: '21,358',
    currency: 'SAR',
    iconName: 'commission',
    rateBadge: '15% Rate',
    trend: '18.2%',
    trendDirection: 'down',
  },
  {
    id: 'payouts',
    titleKey: 'totalPayouts',
    defaultTitle: 'Total Payouts',
    value: '98,500',
    currency: 'SAR',
    iconName: 'payouts',
    trend: '8.5%',
    trendDirection: 'down',
  },
  {
    id: 'net',
    titleKey: 'netVendorPayable',
    defaultTitle: 'Net Vendor Payable',
    value: '11,032',
    currency: 'SAR',
    iconName: 'net',
  },
  {
    id: 'pending',
    titleKey: 'pendingPayout',
    defaultTitle: 'Pending Payout',
    value: '22,532',
    currency: 'SAR',
    iconName: 'pending',
    alertBadgeKey: 'amberAlert',
    alertBadgeDefault: 'Amber Alert',
    alertBadgeType: 'amber',
  },
];
