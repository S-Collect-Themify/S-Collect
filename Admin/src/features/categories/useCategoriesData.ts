import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deactivateAdminCategory,
  reactivateAdminCategory,
  deleteAdminCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '../../services/categories';
import { mapApiCategoryToCategory } from './utils';

export const CATEGORIES_QUERY_KEY = ['admin-categories'];

export const useCategoriesData = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryClient = useQueryClient();

  // ── Fetch Categories Query ──
  const categoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, isAr ? 'ar' : 'en'],
    queryFn: async () => {
      const rawList = await getAdminCategories();
      const mapped = rawList.map(mapApiCategoryToCategory);
      return mapped.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
            return timeB - timeA;
          }
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        const numA = Number(a.id);
        const numB = Number(b.id);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA;
        }
        return String(b.id).localeCompare(String(a.id));
      });
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Create Category Mutation ──
  const createCategoryMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createAdminCategory(payload),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete category');
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error ? (categoriesQuery.error as any)?.message || 'Failed to fetch categories' : null,
    rawError: categoriesQuery.error,
    isFetching: categoriesQuery.isFetching,
    refetch: categoriesQuery.refetch,

    createCategoryMutation,
    updateCategoryMutation,
    deactivateCategoryMutation,
    reactivateCategoryMutation,
    deleteCategoryMutation,
  };
};
