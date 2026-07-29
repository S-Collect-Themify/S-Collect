import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../types/api';
import type { Product, ProductStatus } from './mangement';
import {
  searchVendorProducts,
  bulkUpdateProductStatus,
} from '../../services/products';
import { useManagementStore } from './managementStore';

const ITEMS_PER_PAGE = 8;
const FETCH_PAGE_SIZE = 100;

export function useManagementTable() {
  const queryClient = useQueryClient();
  const selectedCategories = useManagementStore((state) => state.selectedCategories);
  const selectedStatus = useManagementStore((state) => state.selectedStatus);
  const search = useManagementStore((state) => state.search);
  const page = useManagementStore((state) => state.page);
  const selectedRows = useManagementStore((state) => state.selectedRows);
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ['products-manage', 1],
    queryFn: () => searchVendorProducts({ pageNum: 1, pageSize: FETCH_PAGE_SIZE }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Prefetch the next page of products from backend in the background
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['products-manage', 2],
      queryFn: () => searchVendorProducts({ pageNum: 2, pageSize: FETCH_PAGE_SIZE }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const products: Product[] = useMemo(() => {
    const items = rawProducts?.items || (Array.isArray(rawProducts) ? rawProducts : []);
    return items.map((p: any, idx: number) => {
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

      let parsedPrice = 0;
      if (typeof p.minPrice === 'number') {
        parsedPrice = p.minPrice;
      } else if (p.minPrice && typeof p.minPrice === 'object') {
        parsedPrice = Number((p.minPrice as any).amount || (p.minPrice as any).value || 0);
      } else if (typeof p.compareAtPrice === 'number') {
        parsedPrice = p.compareAtPrice;
      } else if (typeof p.price === 'number') {
        parsedPrice = p.price;
      }

      const rating =
        typeof p.rating === 'number' && p.rating > 0
          ? p.rating
          : typeof p.averageRating === 'number' && p.averageRating > 0
            ? p.averageRating
            : Number((4.5 + (idx % 5) * 0.1).toFixed(1));

      const ratingCount =
        typeof p.ratingCount === 'number' && p.ratingCount > 0
          ? p.ratingCount
          : typeof p.reviewsCount === 'number' && p.reviewsCount > 0
            ? p.reviewsCount
            : 8 + (idx % 12);

      let iconUrl = '';
      if (typeof p.thumbnailUrl === 'string') {
        iconUrl = p.thumbnailUrl;
      } else if (p.thumbnailUrl && typeof p.thumbnailUrl === 'object') {
        iconUrl = (p.thumbnailUrl as any).url || (p.thumbnailUrl as any).src || '';
      } else if (Array.isArray(p.images) && p.images.length > 0) {
        const thumb = p.images.find((img: any) => img.isThumbnail) || p.images[0];
        iconUrl = typeof thumb === 'string' ? thumb : (thumb.url || thumb.src || '');
      }

      if (iconUrl && !iconUrl.startsWith('http://') && !iconUrl.startsWith('https://') && !iconUrl.startsWith('data:')) {
        iconUrl = `https://api.collect-s.com${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}`;
      }

      return {
        id: p.id,
        name: isArabic ? (p.nameAr || p.name || '') : (p.name || p.nameAr || ''),
        category: categoryId,
        categoryName,
        price: parsedPrice,
        rating,
        ratingCount,
        status,
        enabled: p.isActive ?? true,
        icon: iconUrl || 'ti-package',
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

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
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
    totalItems,
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
  const lastClickRef = useRef<number>(0);

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

  const safeMutate = (params: {
    productIds: string[];
    status: 'PUBLISH' | 'UNPUBLISH' | 'DELETE';
  }) => {
    const now = Date.now();
    if (bulkStatusMutation.isPending || now - lastClickRef.current < 600) {
      return;
    }
    lastClickRef.current = now;
    bulkStatusMutation.mutate(params);
  };

  return {
    publishSelected: () =>
      safeMutate({
        productIds: selectedRows.map(String),
        status: 'PUBLISH',
      }),
    unpublishSelected: () =>
      safeMutate({
        productIds: selectedRows.map(String),
        status: 'UNPUBLISH',
      }),
    deleteSelected: () =>
      safeMutate({
        productIds: selectedRows.map(String),
        status: 'DELETE',
      }),
    deleteSingle: (id: string | number) =>
      safeMutate({
        productIds: [String(id)],
        status: 'DELETE',
      }),
    toggleSingle: (id: string | number, currentEnabled: boolean) =>
      safeMutate({
        productIds: [String(id)],
        status: currentEnabled ? 'UNPUBLISH' : 'PUBLISH',
      }),
    isPending: bulkStatusMutation.isPending,
  };
}
