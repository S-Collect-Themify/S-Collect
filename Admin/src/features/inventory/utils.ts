import type { StockStatus } from './types';

export function getStatus(stock: number): StockStatus {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return 'Low Stock';
  return 'In Stock';
}
