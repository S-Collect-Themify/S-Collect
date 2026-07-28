export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out Of Stock';
export type StatusFilter = 'All' | ProductStatus;

export interface Product {
  id: string | number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  rating: number;
  ratingCount: number;
  status: ProductStatus;
  enabled: boolean;
  icon: string;
}
