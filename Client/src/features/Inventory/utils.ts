import type { StockStatus } from './types';

export function getStatus(
  stock: number,
  lowStockThreshold: number = 5
): StockStatus {
  if (stock === 0) return 'Out of Stock';
  if (stock <= lowStockThreshold) return 'Low Stock';
  return 'In Stock';
}
