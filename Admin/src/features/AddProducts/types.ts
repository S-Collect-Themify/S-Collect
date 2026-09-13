export type ProductSeason = 'summer' | 'winter' | 'all';

export interface ProductFormData {
  nameAr: string;
  nameEn: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  sku: string;
  images: File[];
  categoryId: string;
  season?: ProductSeason;
  enabled?: boolean;
  quantity?: number;
  categories?: string[];
  sizes?: string[];
  colors?: string[];
}

