export type InventoryAlertStatus = 'Out of Stock' | 'Low Stock' | 'In Stock';

export interface InventoryAlertTheme {
  text: 'var(--red)' | 'var(--yellow)' | 'var(--green)';
  background:
    | 'var(--red-light)'
    | 'var(--yellow-light)'
    | 'var(--green-light)';
}

export interface InventoryAlertItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  stockCount: number;
  status: InventoryAlertStatus;
  theme: InventoryAlertTheme;
  image: string;
}
