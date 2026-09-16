import type { CategoryTreeApiNode } from '../services/products';

// 0 = Department, 1 = Category, 2 = Sub-Category
export interface CategoryTreeNode {
  id: string;
  name: string;
  nameAr: string;
  depth: 0 | 1 | 2;
  isActive: boolean;
  parentCategoryId?: string | null;
  children: CategoryTreeNode[];
}

// Normalizes categories tree or flat category list into a structured 3-tier hierarchy:
// Department (depth 0) -> Category (depth 1) -> Sub-Category (depth 2).
export const buildCategoryTree = (nodes: CategoryTreeApiNode[]): CategoryTreeNode[] => {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  // Check if nodes are pre-nested (contain sub-arrays under `categories` or `children`)
  const isPreNested = nodes.some(
    (node) =>
      (Array.isArray(node.categories) && node.categories.length > 0) ||
      (Array.isArray(node.children) && node.children.length > 0)
  );

  if (isPreNested) {
    const mapNestedNode = (node: CategoryTreeApiNode, fallbackDepth: 0 | 1 | 2): CategoryTreeNode => {
      const rawChildren = node.categories ?? node.children ?? [];
      const nodeDepth =
        typeof node.depth === 'number' && [0, 1, 2].includes(node.depth)
          ? (node.depth as 0 | 1 | 2)
          : fallbackDepth;
      const childFallbackDepth = (nodeDepth === 0 ? 1 : 2) as 0 | 1 | 2;

      return {
        id: node.id,
        name: node.name,
        nameAr: node.nameAr || node.name,
        depth: nodeDepth,
        isActive: node.isActive !== false,
        parentCategoryId: (node as any).parentCategoryId || null,
        children: rawChildren.map((child) => mapNestedNode(child, childFallbackDepth)),
      };
    };

    return nodes.map((node) => mapNestedNode(node, 0));
  }

  // Handle flat array of nodes (e.g. from GET /vendor/categories)
  const nodeMap = new Map<string, CategoryTreeNode>();
  const departments: CategoryTreeNode[] = [];

  nodes.forEach((node) => {
    const nodeDepth =
      typeof node.depth === 'number' && [0, 1, 2].includes(node.depth)
        ? (node.depth as 0 | 1 | 2)
        : (node as any).parentCategoryId
          ? 1
          : 0;

    nodeMap.set(node.id, {
      id: node.id,
      name: node.name,
      nameAr: node.nameAr || node.name,
      depth: nodeDepth,
      isActive: node.isActive !== false,
      parentCategoryId: (node as any).parentCategoryId || null,
      children: [],
    });
  });

  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node.id)!;
    const parentId = (node as any).parentCategoryId;

    if (parentId && nodeMap.has(parentId)) {
      const parentNode = nodeMap.get(parentId)!;
      if (parentNode.depth === 0 && treeNode.depth === 0) {
        treeNode.depth = 1;
      } else if (parentNode.depth === 1 && treeNode.depth <= 1) {
        treeNode.depth = 2;
      }
      parentNode.children.push(treeNode);
    } else {
      if (treeNode.depth === 0 || !parentId) {
        departments.push(treeNode);
      } else {
        departments.push(treeNode);
      }
    }
  });

  return departments;
};

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

// Expands filter selections into full set of leaf category ids
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

// Finds the Department/Category/Sub-Category chain that leads to `targetId`
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

// Returns ordered array of path nodes from Department -> Category -> Sub-Category
export const getCategoryPathNodes = (tree: CategoryTreeNode[], targetId: string): CategoryTreeNode[] => {
  for (const department of tree) {
    if (department.id === targetId) {
      return [department];
    }
    for (const category of department.children) {
      if (category.id === targetId) {
        return [department, category];
      }
      for (const subCategory of category.children) {
        if (subCategory.id === targetId) {
          return [department, category, subCategory];
        }
      }
    }
  }
  return [];
};
