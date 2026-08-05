// ─── Category Entity ──────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name?: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  image?: string;
  productsCount: number;
  isActive: boolean;
  createdAt?: string;
}

