import type { ApiCategoryItem } from '../../services/categories';
import type { Category } from './types';

// ─── Slug Generator ───────────────────────────────────────────────────────────
export const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

// ─── Category Mapper ──────────────────────────────────────────────────────────
export const mapApiCategoryToCategory = (item: ApiCategoryItem): Category => ({
  id: String(item.id),
  name: item.name,
  nameEn: item.nameEn || item.name || '',
  nameAr: item.nameAr || item.name || '',
  slug: item.slug || '',
  isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
  productsCount: item.productsCount ?? 0,
  createdAt: item.createdAt,
});
