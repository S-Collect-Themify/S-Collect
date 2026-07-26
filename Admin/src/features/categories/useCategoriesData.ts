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
  type ApiCategoryItem,
} from '../../services/categories';
import type { Category } from './types';

export const CATEGORIES_QUERY_KEY = ['admin-categories'];

export const useCategoriesData = () => {
  const queryClient = useQueryClient();

  // ── Fetch Categories Query ──
  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const rawList = await getAdminCategories();
      const formattedList: Category[] = rawList.map((item: ApiCategoryItem) => ({
        id: String(item.id),
        name: item.name,
        nameEn: item.nameEn || item.name || '',
        nameAr: item.nameAr || item.name || '',
        slug: item.slug || '',
        isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        productsCount: item.productsCount ?? 0,
        createdAt: item.createdAt,
      }));
      return formattedList;
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
    refetch: categoriesQuery.refetch,

    createCategoryMutation,
    updateCategoryMutation,
    deactivateCategoryMutation,
    reactivateCategoryMutation,
    deleteCategoryMutation,
  };
};
