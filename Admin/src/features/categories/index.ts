// ─── Barrel Export ────────────────────────────────────────────────────────────
// Types
export type { Category } from './types';

// Data
export { INITIAL_CATEGORIES, ITEMS_PER_PAGE } from './data';

// Store
export { useCategoryStore } from '../../store/categoryStore';

// Hook
export { useCategoriesData } from './useCategoriesData';

// Utils
export { toSlug } from './utils';

// Components
export { default as Toggle } from './components/Toggle';
export { CategoryHeader } from './components/CategoryHeader';
export { CategoryFilterBar } from './components/CategoryFilterBar';
export { StatusConfirmModal, DeleteModal, CategoryFormModal, CannotDeleteModal } from './components/CategoryModals';
export type {
  StatusConfirmModalProps,
  DeleteModalProps,
  CategoryFormModalProps,
  CannotDeleteModalProps,
} from './components/CategoryModals';
export { default as CategoryTable } from './components/CategoryTable';
export type { DesktopTableProps } from './components/CategoryTable';
export { default as CategorySkeleton } from './components/CategorySkeleton';
export type { CategorySkeletonProps } from './components/CategorySkeleton';
export { default as MobileCard } from './components/MobileCard';
export type { MobileCardProps } from './components/MobileCard';
export { Pagination, BulkNavbar } from './components/CategoryControls';
export type { PaginationProps, BulkNavbarProps } from './components/CategoryControls';
