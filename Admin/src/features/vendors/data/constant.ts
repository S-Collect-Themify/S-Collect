export const VENDOR_CATEGORIES = [
  'Handicrafts',
  'Florals',
  'Electronics',
  'Apparel',
  'Food',
  'Beauty',
  'Sports',
  'Home & Garden',
  'Fashion',
];

// ── Per-vendor mock detail data ────────────────────────────────────────────────

export interface MockOrder {
  id: string;
  submittedDate: string;
  customerName: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  price: number;
}

export interface MockProduct {
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface MockPayout {
  id: string;
  date: string;
  amount: number;
  referenceNumber: string;
  adminName: string;
  status: 'completed' | 'accepted' | 'pending' | 'rejected';
}

export const VENDOR_MOCK_ORDERS: Record<number, MockOrder[]> = {};

export const VENDOR_MOCK_PRODUCTS: Record<number, MockProduct[]> = {};

export const VENDOR_MOCK_PAYOUTS: Record<number, MockPayout[]> = {};
