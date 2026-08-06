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
export const mapApiCategoryToCategory = (item: ApiCategoryItem): Category => {
  const primaryName = (item.name || item.nameAr || item.nameEn || '').trim();
  const nameAr = (item.nameAr || primaryName).trim();
  const nameEn = (item.nameEn || primaryName).trim();

  return {
    id: String(item.id),
    name: primaryName,
    nameEn: nameEn || primaryName,
    nameAr: nameAr || primaryName,
    slug: item.slug || '',
    description: typeof item.description === 'string' ? item.description : undefined,
    parentCategoryId: typeof item.parentCategoryId === 'string' ? item.parentCategoryId : undefined,
    image: typeof item.image === 'string' ? item.image : (item.imageUrl || ''),
    isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
    productsCount: item.productCount ?? item.productsCount ?? 0,
    createdAt: item.createdAt,
  };
};
