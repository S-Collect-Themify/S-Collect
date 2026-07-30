// ─── Category Entity ──────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name?: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  image?: string;
  productsCount: number;
  isActive: boolean;
  createdAt?: string;
}

