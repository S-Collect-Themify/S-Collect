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
  totalSpent?: number;
  lastActive?: string;
  createdAt?: string;
}

export interface BuyerOrder {
  id: string;
  products: string;
  date: string;
  amount: number;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Pending';
}
