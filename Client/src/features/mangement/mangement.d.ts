export type ProductStatus = 'Published' | 'Unpublished' | 'Disabled';
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
  isDisabled?: boolean;
  icon: string;
}
