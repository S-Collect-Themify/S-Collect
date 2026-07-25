import type { PayoutStatCardData } from '../types';

export const INITIAL_PAYOUT_STATS: PayoutStatCardData[] = [
  {
    id: 'stat1',
    titleKey: 'payouts.totalRegisteredTitle',
    defaultTitle: 'Total Payouts Registered',
    value: '45,200',
    unit: 'SAR',
    badgeTextKey: 'payouts.badgeActivePeriod',
    defaultBadgeText: 'Active Period',
    badgeVariant: 'emerald',
    iconType: 'check',
  },
  {
    id: 'stat2',
    titleKey: 'payouts.pendingPayoutsTitle',
    defaultTitle: 'Pending Payouts',
    value: '76,832',
    unit: 'SAR',
    badgeTextKey: 'payouts.badgeRequiresAction',
    defaultBadgeText: 'Requires Action',
    badgeVariant: 'amber',
    iconType: 'clock',
  },
  {
    id: 'stat3',
    titleKey: 'payouts.vendorsWithPendingTitle',
    defaultTitle: 'Vendors with Pending',
    value: '12',
    unit: 'Vendors',
    badgeTextKey: 'payouts.badgeAllAccounts',
    defaultBadgeText: 'All Accounts',
    badgeVariant: 'blue',
    iconType: 'users',
  },
];
