export const VENDOR_CATEGORIES: string[] = [];

export interface VendorRecentOrder {
  id: string;
  submittedDate: string;
  customerName: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  price: number;
}

export interface VendorRecentProduct {
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface VendorRecentPayout {
  id: string;
  date: string;
  amount: number;
  referenceNumber: string;
  adminName: string;
  status: 'completed' | 'accepted' | 'pending' | 'rejected';
}
