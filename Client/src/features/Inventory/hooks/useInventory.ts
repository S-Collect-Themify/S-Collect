import { useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../types/api';
import { ITEMS_PER_PAGE, type ProductRow } from '../types';
import { getStatus } from '../utils';
import type { FilterKey } from '../constants';
import {
  getVendorInventory,
  bulkUpdateVariantStock,
} from '../../../services/inventory';

export function useInventory() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = i18n.language === 'ar';

  // URL search params as the source of truth for UI state (0 useState, 0 useEffect!)
  const search = searchParams.get('search') || '';
  const activeTab = (searchParams.get('status') || 'all') as FilterKey;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Keep track of unsaved local stock edits in a ref
  const pendingChanges = useRef<
    Record<string, { productId: string; variantId: string; stock: number }>
  >({});

  // Compute minStock/maxStock from activeTab
  let minStock: number | undefined = undefined;
  let maxStock: number | undefined = undefined;
  if (activeTab === 'Out of Stock') {
    minStock = 0;
    maxStock = 0;
  } else if (activeTab === 'Low Stock') {
    minStock = 1;
    maxStock = 5;
  } else if (activeTab === 'In Stock') {
    minStock = 6;
    maxStock = undefined;
  }

  // Query real inventory from the API with dependencies
  const { data: rawInventory } = useQuery({
    queryKey: ['inventory', currentPage, activeTab, search],
    queryFn: () =>
      getVendorInventory({
        pageNum: currentPage,
        pageSize: ITEMS_PER_PAGE,
        search: search || undefined,
        minStock,
        maxStock,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Convert raw product variants to flat rows
  const rows: ProductRow[] = useMemo(() => {
    const items = rawInventory?.items || [];
    return items
      // eslint-disable-next-line react-hooks/refs
      .filter((item) => {
        const uniqueId = `${item.productId}::${item.variantId}`;
        const stock =
          pendingChanges.current[uniqueId] !== undefined
            ? pendingChanges.current[uniqueId].stock
            : item.stock || 0;
        if (activeTab === 'Out of Stock') return stock === 0;
        if (activeTab === 'Low Stock') return stock >= 1 && stock <= 5;
        if (activeTab === 'In Stock') return stock > 5;
        return true;
      })
      // eslint-disable-next-line react-hooks/refs
      .map((item) => {
        const uniqueId = `${item.productId}::${item.variantId}`;
        const name = isAr
          ? item.productNameAr || item.productName || ''
          : item.productName || item.productNameAr || '';

        const variantStr = isAr
          ? item.labelNameAr || item.labelName || 'الافتراضي'
          : item.labelName || item.labelNameAr || 'Default';

        const updatedAt = item.lastUpdatedAt
          ? new Date(item.lastUpdatedAt).toLocaleDateString(
              isAr ? 'ar-EG' : 'en-US'
            )
          : '';

        // Use pending change stock if user edited it, otherwise backend stock
        const stock =
          pendingChanges.current[uniqueId] !== undefined
            ? pendingChanges.current[uniqueId].stock
            : item.stock || 0;

        return {
          id: uniqueId,
          name,
          sku: item.sku || '',
          variant: variantStr,
          stock,
          updatedAt,
          status: getStatus(stock),
        };
      });
  }, [rawInventory, isAr, activeTab]);

  // Derived data
  const totalItems = rawInventory?.pagination?.totalItems || 0;
  const totalPages = rawInventory?.pagination?.totalPages || 0;
  const paginatedData = rows;

  // Prefetch the next page data in background
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ['inventory', nextPage, activeTab, search],
        queryFn: () =>
          getVendorInventory({
            pageNum: nextPage,
            pageSize: ITEMS_PER_PAGE,
            search: search || undefined,
            minStock,
            maxStock,
          }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [
    currentPage,
    totalPages,
    activeTab,
    search,
    minStock,
    maxStock,
    queryClient,
  ]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // Handlers for search, filters, and pagination using setSearchParams
  const handleFilterChange = (key: FilterKey) => {
    setSearchParams((prev) => {
      if (key === 'all') {
        prev.delete('status');
      } else {
        prev.set('status', key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      if (!value) {
        prev.delete('search');
      } else {
        prev.set('search', value);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
  };

  // Stock change modifies both the ref and query cache so the UI updates instantly
  const handleStockChange = (id: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const [productId, variantId] = id.split('::');

    pendingChanges.current[id] = { productId, variantId, stock: num };

    // Update query cache so that the new stock reflects immediately in the UI (0 useState!)
    queryClient.setQueryData(
      ['inventory', currentPage, activeTab, search],
      (old: any) => {
        if (!old) return old;

        const items = old.items || [];
        const updatedItems = items.map((item: any) => {
          if (String(item.variantId) === variantId) {
            return { ...item, stock: num };
          }
          return item;
        });

        return {
          ...old,
          items: updatedItems,
        };
      }
    );
  };

  // Mutation to save stock modifications in batch
  const saveMutation = useMutation({
    mutationFn: async (
      changesList: { productId: string; variantId: string; stock: number }[]
    ) => {
      const updates = changesList.map(({ variantId, stock }) => ({
        variantId,
        stock,
      }));
      return bulkUpdateVariantStock({ updates });
    },
    onSuccess: () => {
      toast.success(
        t('inventoryPage.saveSuccess', 'Changes saved successfully!')
      );
      pendingChanges.current = {};
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      console.error('Failed to save stock changes:', err);
      toast.error(
        getErrorMessage(
          err,
          t('inventoryPage.saveFailed', 'Failed to save changes.')
        )
      );
    },
  });

  const lastSaveClickRef = useRef<number>(0);

  const handleSave = async () => {
    const now = Date.now();
    if (saveMutation.isPending || now - lastSaveClickRef.current < 600) {
      return;
    }
    lastSaveClickRef.current = now;

    const changesList = Object.values(pendingChanges.current);
    if (changesList.length === 0) {
      toast.error(t('inventoryPage.noChanges', 'No changes to save.'));
      return;
    }
    saveMutation.mutate(changesList);
  };

  return {
    // State
    search,
    activeTab,
    currentPage,
    // Derived data
    paginatedData,
    totalItems,
    totalPages,
    pageNumbers,
    // Handlers
    handleFilterChange,
    handleSearchChange,
    handleStockChange,
    handlePageChange,
    handleSave,
    isSaving: saveMutation.isPending,
  };
}
