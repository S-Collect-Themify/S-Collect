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
    value: '--',
    currency: 'SAR',
    iconName: 'gmv',
  },
  {
    id: 'commission',
    titleKey: 'platformCommission',
    defaultTitle: 'Platform Commission',
    value: '--',
    currency: 'SAR',
    iconName: 'commission',
  },
  {
    id: 'payouts',
    titleKey: 'totalPayouts',
    defaultTitle: 'Total Payouts',
    value: '--',
    currency: 'SAR',
    iconName: 'payouts',
  },
  {
    id: 'net',
    titleKey: 'netVendorPayable',
    defaultTitle: 'Net Vendor Payable',
    value: '--',
    currency: 'SAR',
    iconName: 'net',
  },
  {
    id: 'pending',
    titleKey: 'pendingPayout',
    defaultTitle: 'Pending Payout',
    value: '--',
    currency: 'SAR',
    iconName: 'pending',
  },
];
