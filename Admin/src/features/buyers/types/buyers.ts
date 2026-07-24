export type BuyerStatus = 'active' | 'suspended';

export interface Buyer {
  id: number;
  name: string;
  email: string;
  date: string;
  ordersNum: number;
  status: BuyerStatus;
  location?: string;
  totalSpent?: number;
  lastActive?: string;
}

export interface BuyerOrder {
  id: string;
  products: string;
  date: string;
  amount: number;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Pending';
}
