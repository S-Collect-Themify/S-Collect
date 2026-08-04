export type BuyerStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'LOCKED'
  | 'DEACTIVATED'
  | 'active'
  | 'suspended'
  | string;

export interface Buyer {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  date: string;
  ordersNum: number | string;
  status: BuyerStatus;
  location?: string;
  totalSpent?: number | string | null;
  avgOrderValue?: number | string | null;
  lastActive?: string | null;
  createdAt?: string;
}

export interface BuyerOrder {
  id: string;
  products: string;
  date: string;
  amount: number | string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Pending' | string;
}
