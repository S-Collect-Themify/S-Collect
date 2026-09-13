import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminCategoriesTree,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deactivateAdminCategory,
  reactivateAdminCategory,
  deleteAdminCategory,
  applyCategoryBulkDiscount,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type CategoryBulkDiscountPayload,
} from '../../services/categories';
import { buildCategoryTree, flattenCategoryTree, mapApiCategoryToCategory } from './utils';

export const CATEGORIES_QUERY_KEY = ['admin-categories-tree'];
export const CATEGORIES_FLAT_QUERY_KEY = ['admin-categories-flat'];

export const useCategoriesData = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryClient = useQueryClient();

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: CATEGORIES_FLAT_QUERY_KEY });
  };

  // ── Fetch Category Tree Query (Department → Category → Sub-Category) ──
  const categoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, isAr ? 'ar' : 'en'],
    queryFn: async () => {
      const rawTree = await getAdminCategoriesTree();
      return buildCategoryTree(rawTree);
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Fetch Flat Category List ──
  // The tree only contains nodes reachable from a Department (parentCategoryId
  // chain). Categories created before this hierarchy existed (or otherwise
  // detached) still exist and must stay editable, so we diff the flat list
  // against the tree to surface them as "unassigned".
  const flatQuery = useQuery({
    queryKey: [...CATEGORIES_FLAT_QUERY_KEY, isAr ? 'ar' : 'en'],
    queryFn: async () => {
      const rawList = await getAdminCategories();
      return rawList.map(mapApiCategoryToCategory);
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const tree = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const treeCategories = useMemo(() => flattenCategoryTree(tree), [tree]);

  const orphans = useMemo(() => {
    const treeIds = new Set(treeCategories.map((c) => c.id));
    return (flatQuery.data || []).filter((c) => !treeIds.has(c.id));
  }, [flatQuery.data, treeCategories]);

  // Combined list (tree nodes + unassigned) used for duplicate-name checks
  // and parent pickers, so an unassigned category can still be selected as a
  // Sub-Category's parent, and its name still blocks duplicates.
  const categories = useMemo(() => [...treeCategories, ...orphans], [treeCategories, orphans]);

  // ── Create Category Mutation ──
  const createCategoryMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createAdminCategory(payload),
    onSuccess: () => {
      toast.success('Category created successfully');
      invalidateCategories();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create category');
    },
  });

  // ── Update Category Mutation ──
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateAdminCategory(id, payload),
    onSuccess: () => {
      toast.success('Category updated successfully');
      invalidateCategories();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update category');
    },
  });

  // ── Deactivate Category Mutation ──
  const deactivateCategoryMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminCategory(id),
    onSuccess: () => {
      toast.success('Category deactivated successfully');
      invalidateCategories();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to deactivate category');
    },
  });

  // ── Reactivate Category Mutation ──
  const reactivateCategoryMutation = useMutation({
    mutationFn: (id: string) => reactivateAdminCategory(id),
    onSuccess: () => {
      toast.success('Category reactivated successfully');
      invalidateCategories();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to reactivate category');
    },
  });

  // ── Delete Category Mutation ──
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      invalidateCategories();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete category');
    },
  });

  // ── Apply Category Bulk Discount Mutation ──
  const applyBulkDiscountMutation = useMutation({
    mutationFn: (payload: CategoryBulkDiscountPayload) => applyCategoryBulkDiscount(payload),
    onSuccess: () => {
      toast.success(isAr ? 'تم تطبيق الخصم بنجاح' : 'Discount applied successfully');
      invalidateCategories();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || (isAr ? 'فشل تطبيق الخصم' : 'Failed to apply discount'));
    },
  });

  return {
    tree,
    categories,
    orphans,
    isLoading: categoriesQuery.isLoading || flatQuery.isLoading,
    isError: categoriesQuery.isError || flatQuery.isError,
    error: categoriesQuery.error ? (categoriesQuery.error as any)?.message || 'Failed to fetch categories' : null,
    rawError: categoriesQuery.error,
    isFetching: categoriesQuery.isFetching || flatQuery.isFetching,
    refetch: () => {
      categoriesQuery.refetch();
      flatQuery.refetch();
    },

    createCategoryMutation,
    updateCategoryMutation,
    deactivateCategoryMutation,
    reactivateCategoryMutation,
    deleteCategoryMutation,
    applyBulkDiscountMutation,
  };
};
