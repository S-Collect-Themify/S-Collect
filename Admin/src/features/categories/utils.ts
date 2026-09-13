import type { ApiCategoryItem } from '../../services/categories';
import type { Category, CategoryDepth, CategoryTreeNode } from './types';

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
  const depth = item.depth === 0 || item.depth === 1 || item.depth === 2 ? item.depth : 1;

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
    depth: depth as CategoryDepth,
  };
};

// ─── Tree Builder ──────────────────────────────────────────────────────────────
// Normalizes the raw /categories/tree response into a single recursive shape.
// Departments nest their children under `categories`, categories nest theirs
// under `children` — this walks whichever key is present at each level.
export const buildCategoryTree = (items: ApiCategoryItem[]): CategoryTreeNode[] =>
  items.map((item) => {
    const rawChildren = item.categories ?? item.children ?? [];
    return {
      ...mapApiCategoryToCategory(item),
      children: buildCategoryTree(rawChildren),
    };
  });

// ─── Tree Flattener ────────────────────────────────────────────────────────────
// Flattens a tree into a plain list (depth preserved) for search, duplicate-name
// checks, and parent-picker dropdowns that need every node regardless of nesting.
export const flattenCategoryTree = (nodes: CategoryTreeNode[]): Category[] =>
  nodes.flatMap(({ children, ...category }) => [category as Category, ...flattenCategoryTree(children)]);

// ─── Tree Search Filter ────────────────────────────────────────────────────────
// Keeps a node if it matches the query itself, or if any of its descendants do
// (so a matching Sub-Category keeps its parent Category and Department visible).
export const filterCategoryTree = (nodes: CategoryTreeNode[], query: string): CategoryTreeNode[] => {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const walk = (list: CategoryTreeNode[]): CategoryTreeNode[] =>
    list.reduce<CategoryTreeNode[]>((acc, node) => {
      const children = walk(node.children);
      const selfMatches =
        node.nameEn.toLowerCase().includes(q) ||
        node.nameAr.toLowerCase().includes(q) ||
        node.slug.toLowerCase().includes(q);

      if (selfMatches || children.length > 0) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);

  return walk(nodes);
};
