export interface PayoutStatCardData {
  id: string;
  titleKey: string;
  defaultTitle: string;
  value: string;
  unit: string;
  badgeTextKey: string;
  defaultBadgeText: string;
  badgeVariant: 'emerald' | 'amber' | 'blue';
  iconType: 'check' | 'clock' | 'users';
}

export interface PendingPayoutItem {
  id: string;
  vendorName: string;
  bankAccount: string;
  totalGmv: number;
  commission: number;
  totalPayouts: number;
  pendingPayout: number;
  status: string;
}

export interface RegisterPayoutFormState {
  vendorId: string;
  vendorName: string;
  bankAccount: string;
  pendingPayout: number;
  amount: string;
  notes: string;
  date: string;
}
