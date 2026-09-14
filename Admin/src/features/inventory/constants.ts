export const FILTER_TABS = [
  { key: 'all', label: 'inventoryPage.allProducts' },
  { key: 'In Stock', label: 'inventoryPage.inStock' },
  { key: 'Low Stock', label: 'inventoryPage.lowStock' },
  { key: 'Out of Stock', label: 'inventoryPage.outOfStock' },
] as const;

export type FilterKey = 'all' | 'In Stock' | 'Low Stock' | 'Out of Stock';
