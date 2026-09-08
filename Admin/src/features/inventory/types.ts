export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  variant: string;
  stock: number;
  updatedAt: string;
}

export interface ProductRow extends Product {
  status: StockStatus;
}

export const STATUS_STYLES: Record<StockStatus, string> = {
  'In Stock': 'bg-green-light text-green',
  'Low Stock': 'bg-yellow-light text-yellow',
  'Out of Stock': 'bg-red-light text-red',
};

export const ITEMS_PER_PAGE = 8;
