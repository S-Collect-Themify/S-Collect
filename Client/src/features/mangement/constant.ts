import type { Product, ProductStatus, StatusFilter } from './mangement';

export const INITIAL_PRODUCTS: Product[] = [];

export const CATEGORIES = [
  "Women's clothing",
  "Men's clothing",
  'Shoes',
  'Accessories',
  'Youth clothes',
];

export const STATUS_FILTERS: StatusFilter[] = [
  'All',
  'Published',
  'Unpublished',
  'Disabled',
];

export const TOTAL_PRODUCTS = 48;
export const TOTAL_PAGES = 3;

export const STATUS_BADGE: Record<ProductStatus, string> = {
  Published: 'bg-green-100 text-green-800',
  Unpublished: 'bg-amber-100 text-amber-800',
  Disabled: 'bg-red-100 text-red-800',
};

export const THUMB_STYLES: Record<string, { bg: string; icon: string }> = {
  "Women's clothing": {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
  },
  "Men's clothing": {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
  },
  Shoes: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
  },
  Accessories: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
  },
  'Youth clothes': {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
  },
};
