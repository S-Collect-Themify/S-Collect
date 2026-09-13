import type { CategoryTreeApiNode } from '../services/products';

// 0 = Department, 1 = Category, 2 = Sub-Category
export interface CategoryTreeNode {
  id: string;
  name: string;
  nameAr: string;
  depth: 0 | 1 | 2;
  isActive: boolean;
  children: CategoryTreeNode[];
}

// Normalizes /buyer/categories/tree into one recursive shape — departments
// nest their children under `categories`, categories nest theirs under
// `children`; this walks whichever key is present at each level.
export const buildCategoryTree = (nodes: CategoryTreeApiNode[]): CategoryTreeNode[] =>
  nodes.map((node) => {
    const rawChildren = node.categories ?? node.children ?? [];
    const depth = node.depth === 0 || node.depth === 1 || node.depth === 2 ? node.depth : 1;
    return {
      id: node.id,
      name: node.name,
      nameAr: node.nameAr || node.name,
      depth,
      isActive: node.isActive !== false,
      children: buildCategoryTree(rawChildren),
    };
  });

// Finds a node anywhere in the tree by id, regardless of depth.
export const findNode = (tree: CategoryTreeNode[], id: string): CategoryTreeNode | null => {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
};

const collectIds = (node: CategoryTreeNode): string[] => [node.id, ...node.children.flatMap(collectIds)];

// Expands filter selections (which may be Department, Category, or
// Sub-Category ids) into the full set of leaf category ids they cover, so
// picking a Department also matches products filed under any of its
// Categories/Sub-Categories, and picking a Category matches its Sub-Categories.
export const expandCategoryIds = (tree: CategoryTreeNode[], selectedIds: string[]): Set<string> => {
  const result = new Set<string>();
  for (const id of selectedIds) {
    const node = findNode(tree, id);
    if (node) {
      collectIds(node).forEach((i) => result.add(i));
    } else {
      result.add(id);
    }
  }
  return result;
};

export interface CategoryAncestry {
  departmentId: string;
  categoryId: string;
  subCategoryId: string;
}

// Finds the Department/Category/Sub-Category chain that leads to `targetId`,
// used to preselect the cascading picker when editing an existing product.
export const findCategoryAncestry = (tree: CategoryTreeNode[], targetId: string): CategoryAncestry | null => {
  for (const department of tree) {
    if (department.id === targetId) {
      return { departmentId: department.id, categoryId: '', subCategoryId: '' };
    }
    for (const category of department.children) {
      if (category.id === targetId) {
        return { departmentId: department.id, categoryId: category.id, subCategoryId: '' };
      }
      for (const subCategory of category.children) {
        if (subCategory.id === targetId) {
          return { departmentId: department.id, categoryId: category.id, subCategoryId: subCategory.id };
        }
      }
    }
  }
  return null;
};
