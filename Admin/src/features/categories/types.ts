// ─── Category Hierarchy ───────────────────────────────────────────────────────
// 0 = Department (fixed: Men / Women / Kids), 1 = Category, 2 = Sub-Category
export type CategoryDepth = 0 | 1 | 2;

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
  depth: CategoryDepth;
}

// ─── Category Tree Node ───────────────────────────────────────────────────────
// The nested shape returned by /categories/tree, normalized to a single
// recursive `children` field regardless of the raw API's per-level key
// (departments nest under `categories`, categories nest under `children`).
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
