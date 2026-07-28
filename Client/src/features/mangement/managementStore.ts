import { create } from 'zustand';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../types/api';
import type { Product, ProductStatus, StatusFilter } from './mangement';
import {
  searchVendorProducts,
  bulkUpdateProductStatus,
} from '../../services/products';

const ITEMS_PER_PAGE = 8;

type ManagementStore = {
  selectedCategories: string[];
  selectedStatus: StatusFilter;
  search: string;
  page: number;
  selectedRows: (string | number)[];
  setSearch: (search: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedStatus: (status: StatusFilter) => void;
  setPage: (page: number) => void;
  toggleRow: (id: string | number) => void;
  setSelectedRows: (ids: (string | number)[]) => void;
  clearSelection: () => void;
};

export const useManagementStore = create<ManagementStore>((set) => ({
  selectedCategories: [],
  selectedStatus: 'All',
  search: '',
  page: 1,
  selectedRows: [],
  setSearch: (search) => set({ search, page: 1 }),
  setSelectedCategories: (selectedCategories) =>
    set({ selectedCategories, page: 1 }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, page: 1 }),
  setPage: (page) => set({ page }),
  toggleRow: (id) =>
    set((state) => ({
      selectedRows: state.selectedRows.includes(id)
        ? state.selectedRows.filter((rowId) => rowId !== id)
        : [...state.selectedRows, id],
    })),
  setSelectedRows: (selectedRows) => set({ selectedRows }),
  clearSelection: () => set({ selectedRows: [] }),
}));

export function useManagementTable() {
  const selectedCategories = useManagementStore((state) => state.selectedCategories);
  const selectedStatus = useManagementStore((state) => state.selectedStatus);
  const search = useManagementStore((state) => state.search);
  const page = useManagementStore((state) => state.page);
  const selectedRows = useManagementStore((state) => state.selectedRows);
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ['products-manage'],
    queryFn: () => searchVendorProducts({ pageNum: 1, pageSize: 25 }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const products: Product[] = useMemo(() => {
    const items = rawProducts?.items || [];
    return items.map((p: any) => {
      // Search endpoint doesn't return variants; determine status from isActive/isDisabled
      const status: ProductStatus = p.isDisabled
        ? 'Out Of Stock'
        : p.isActive
          ? 'In Stock'
          : 'Low Stock';

      const catObj = p.category || {};
      const categoryId = p.categoryId || catObj.id || '';
      const categoryName = isArabic
        ? (catObj.nameAr || catObj.name || '')
        : (catObj.name || catObj.nameAr || '');

      return {
        id: p.id,
        name: isArabic ? (p.nameAr || p.name || '') : (p.name || p.nameAr || ''),
        category: categoryId,
        categoryName,
        price: p.minPrice || 0,
        rating: 0,
        ratingCount: 0,
        status,
        enabled: p.isActive ?? true,
        icon: p.thumbnailUrl || 'ti-package',
      } as Product;
    });
  }, [rawProducts, isArabic]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(String(product.category))
      ) {
        return false;
      }

      if (selectedStatus !== 'All' && product.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [products, search, selectedCategories, selectedStatus]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return {
    itemsPerPage: ITEMS_PER_PAGE,
    isLoading,
    products,
    selectedCategories,
    selectedStatus,
    search,
    page,
    selectedRows,
    filteredProducts,
    paginatedProducts,
    totalItems: filteredProducts.length,
    totalPages,
    selectedCount: selectedRows.length,
    allChecked:
      paginatedProducts.length > 0 &&
      paginatedProducts.every((product) => selectedRows.includes(product.id)),
  };
}

export function useManagementActions() {
  const queryClient = useQueryClient();
  const selectedRows = useManagementStore((s) => s.selectedRows);
  const clearSelection = useManagementStore((s) => s.clearSelection);

  const bulkStatusMutation = useMutation({
    mutationFn: (params: {
      productIds: string[];
      status: 'PUBLISH' | 'UNPUBLISH' | 'DELETE';
    }) => bulkUpdateProductStatus(params),
    onSuccess: (_, variables) => {
      if (variables.status === 'DELETE') {
        toast.success('Deleted successfully!');
      } else if (variables.status === 'PUBLISH') {
        toast.success('Published successfully!');
      } else {
        toast.success('Unpublished successfully!');
      }
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Action failed'));
    },
  });

  return {
    publishSelected: () =>
      bulkStatusMutation.mutate({
        productIds: selectedRows.map(String),
        status: 'PUBLISH',
      }),
    unpublishSelected: () =>
      bulkStatusMutation.mutate({
        productIds: selectedRows.map(String),
        status: 'UNPUBLISH',
      }),
    deleteSelected: () =>
      bulkStatusMutation.mutate({
        productIds: selectedRows.map(String),
        status: 'DELETE',
      }),
    deleteSingle: (id: string | number) =>
      bulkStatusMutation.mutate({
        productIds: [String(id)],
        status: 'DELETE',
      }),
    toggleSingle: (id: string | number, currentEnabled: boolean) =>
      bulkStatusMutation.mutate({
        productIds: [String(id)],
        status: currentEnabled ? 'UNPUBLISH' : 'PUBLISH',
      }),
    isPending: bulkStatusMutation.isPending,
  };
}
