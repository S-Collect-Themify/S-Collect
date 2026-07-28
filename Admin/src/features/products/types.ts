export interface ProductItem {
  id: string | number;
  name: string;
  nameAr?: string;
  vendor: string;
  vendorId?: string;
  category: string;
  categoryAr?: string;
  price: number;
  stock?: number | string;
  isActive: boolean;
  image: string;
}

export type StatusFilter = 'all' | 'active' | 'disabled';

export interface DisableModalState {
  open: boolean;
  product: ProductItem | null;
  targetStatus: boolean;
}
