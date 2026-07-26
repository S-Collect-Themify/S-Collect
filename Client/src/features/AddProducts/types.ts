export interface ExistingImage {
  id: string;
  url: string;
  isThumbnail: boolean;
}

export interface OptionValueMeta {
  id: string;
  value: string;
  valueAr: string;
}

export interface OptionMeta {
  id: string;
  name: string;
  nameAr: string;
  values: OptionValueMeta[];
}

export interface VariantMeta {
  id: string;
  optionValueIds: string[];
}

export interface ProductFormData {
  nameAr: string;
  nameEn: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  sku: string;
  images: File[];
  existingImages?: ExistingImage[];
  optionsMeta?: OptionMeta[];
  variantsMeta?: VariantMeta[];
  categoryId: string;
  enabled?: boolean;
  quantity?: number;
  categories?: string[];
  sizes?: string[];
  colors?: string[];
}

export type AddProductStep = 'form' | 'review' | 'success';

export interface ProductOptionValue {
  id?: string;
  value?: string;
  valueAr?: string;
}

export interface ProductOption {
  id?: string;
  name?: string;
  nameAr?: string;
  values?: ProductOptionValue[];
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
  optionValues?: any[];
}

export interface ProductImage {
  id?: string;
  url?: string;
  isThumbnail?: boolean;
}

export interface RawProductResponse {
  id?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  category?: { id?: string; name?: string; nameAr?: string };
  enabled?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  isFeatured?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  images?: ProductImage[];
  thumbnailUrl?: string;
}
