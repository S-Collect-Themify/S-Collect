export type TransactionStatus =
  'paid' | 'processing' | 'pending' | 'adjusted' | 'failed';

export interface Transaction {
  date: string;
  referenceNumber: string;
  status: TransactionStatus;
  amount: number;
}

export const transactions: Transaction[] = [
  {
    date: 'Jul 16, 2025',
    referenceNumber: 'REF-2025-07-001',
    status: 'paid',
    amount: 17240.0,
  },
  {
    date: 'Jun 29, 2025',
    referenceNumber: 'REF-2025-06-042',
    status: 'paid',
    amount: 7998.5,
  },
  {
    date: 'Jun 19, 2025',
    referenceNumber: 'REF-2025-06-033',
    status: 'processing',
    amount: 3210.0,
  },
  {
    date: 'Jun 5, 2025',
    referenceNumber: 'REF-2025-06-018',
    status: 'paid',
    amount: 6475.0,
  },
  {
    date: 'May 22, 2025',
    referenceNumber: 'REF-2025-05-029',
    status: 'paid',
    amount: 6120.75,
  },
  {
    date: 'May 14, 2025',
    referenceNumber: 'REF-2025-05-ADJ',
    status: 'adjusted',
    amount: -680.0,
  },
  {
    date: 'May 2, 2025',
    referenceNumber: 'REF-2025-05-011',
    status: 'paid',
    amount: 4580.0,
  },
  {
    date: 'Apr 25, 2025',
    referenceNumber: 'REF-2025-04-037',
    status: 'pending',
    amount: 2750.25,
  },
  {
    date: 'Apr 14, 2025',
    referenceNumber: 'REF-2025-04-025',
    status: 'paid',
    amount: 8945.0,
  },
  {
    date: 'Apr 1, 2025',
    referenceNumber: 'REF-2025-04-008',
    status: 'processing',
    amount: 1890.0,
  },
  {
    date: 'Mar 22, 2025',
    referenceNumber: 'REF-2025-03-031',
    status: 'paid',
    amount: 11200.0,
  },
  {
    date: 'Mar 15, 2025',
    referenceNumber: 'REF-2025-03-019',
    status: 'failed',
    amount: 980.0,
  },
  {
    date: 'Mar 8, 2025',
    referenceNumber: 'REF-2025-03-014',
    status: 'paid',
    amount: 5240.5,
  },
  {
    date: 'Feb 28, 2025',
    referenceNumber: 'REF-2025-02-027',
    status: 'paid',
    amount: 14320.0,
  },
  {
    date: 'Feb 17, 2025',
    referenceNumber: 'REF-2025-02-015',
    status: 'processing',
    amount: 3760.0,
  },
  {
    date: 'Feb 5, 2025',
    referenceNumber: 'REF-2025-02-004',
    status: 'paid',
    amount: 6850.0,
  },
  {
    date: 'Jan 28, 2025',
    referenceNumber: 'REF-2025-01-030',
    status: 'paid',
    amount: 9175.0,
  },
  {
    date: 'Jan 16, 2025',
    referenceNumber: 'REF-2025-01-021',
    status: 'pending',
    amount: 2240.0,
  },
  {
    date: 'Jan 9, 2025',
    referenceNumber: 'REF-2025-01-012',
    status: 'paid',
    amount: 10560.0,
  },
  {
    date: 'Dec 22, 2024',
    referenceNumber: 'REF-2024-12-041',
    status: 'paid',
    amount: 7810.75,
  },
  {
    date: 'Dec 11, 2024',
    referenceNumber: 'REF-2024-12-026',
    status: 'adjusted',
    amount: -250.0,
  },
  {
    date: 'Nov 29, 2024',
    referenceNumber: 'REF-2024-11-039',
    status: 'paid',
    amount: 13490.0,
  },
  {
    date: 'Nov 18, 2024',
    referenceNumber: 'REF-2024-11-023',
    status: 'processing',
    amount: 2980.0,
  },
  {
    date: 'Nov 5, 2024',
    referenceNumber: 'REF-2024-11-007',
    status: 'paid',
    amount: 5630.0,
  },
];

export const STATUS_BADGE: Record<TransactionStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  adjusted: 'bg-purple-100 text-purple-800',
  failed: 'bg-red-100 text-red-800',
};

export const STATUS_FILTERS: TransactionStatus[] = [
  'paid',
  'processing',
  'pending',
  'adjusted',
  'failed',
];

export const ITEMS_PER_PAGE = 8;

export type PayoutIconName = 'Chart' | 'Percent' | 'Wallet' | 'Clock';
export type PayoutColor = 'green' | 'orange' | 'blue' | 'purple';

export interface PayoutSummary {
  id: number;
  title: string;
  value: string;
  suffix: string;
  trend: string | null;
  trendLabel: string;
  icon: PayoutIconName;
  color: PayoutColor;
}

export const payoutSummary: PayoutSummary[] = [
  {
    id: 1,
    title: 'Gross Merchandise Value (GMV)',
    value: '345,200',
    suffix: 'SAR',
    trend: '+12.3%',
    trendLabel: 'from last period',
    icon: 'Chart',
    color: 'green',
  },
  {
    id: 2,
    title: 'Platform Commission',
    value: '41,424',
    suffix: 'SAR',
    trend: null,
    trendLabel: '~10% commission rate',
    icon: 'Percent',
    color: 'orange',
  },
  {
    id: 3,
    title: 'Net Receivable',
    value: '$41,236.80',
    suffix: '',
    trend: '+8.7%',
    trendLabel: 'from last period',
    icon: 'Wallet',
    color: 'blue',
  },
  {
    id: 4,
    title: 'Payout Pending',
    value: '303,776',
    suffix: 'SAR',
    trend: '+2.1%',
    trendLabel: 'from last period',
    icon: 'Clock',
    color: 'purple',
  },
];
