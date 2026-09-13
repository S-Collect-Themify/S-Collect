// ─── Barrel Export ────────────────────────────────────────────────────────────
// Types
export type { Category, CategoryDepth, CategoryTreeNode } from './types';

// Store
export { useCategoryStore } from '../../store/categoryStore';

// Hook
export { useCategoriesData } from './useCategoriesData';

// Utils
export { toSlug, buildCategoryTree, flattenCategoryTree, filterCategoryTree } from './utils';

// Components
export { default as Toggle } from '../../components/ui/Toggle';
export { CategoryHeader } from './components/CategoryHeader';
export { CategoryFilterBar } from './components/CategoryFilterBar';
export { StatusConfirmModal, DeleteModal, CategoryFormModal, CannotDeleteModal } from './components/CategoryModals';
export type {
  StatusConfirmModalProps,
  DeleteModalProps,
  CategoryFormModalProps,
  CannotDeleteModalProps,
} from './components/CategoryModals';
export { default as CategoryTree } from './components/CategoryTree';
export type { CategoryTreeProps } from './components/CategoryTree';
export { default as CategorySkeleton } from './components/CategorySkeleton';
export type { CategorySkeletonProps } from './components/CategorySkeleton';
export { BulkNavbar } from './components/CategoryControls';
export type { BulkNavbarProps } from './components/CategoryControls';
