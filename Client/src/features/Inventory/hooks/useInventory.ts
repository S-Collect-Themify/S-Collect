import { useState, useMemo, useRef, useEffect } from 'react';
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
  type InventoryStockStatus,
} from '../../../services/inventory';
import { useInventorySettingsStore } from '../../../store/inventorySettingsStore';
import { useInventoryExport } from './useInventoryExport';

const resolveLabel = (label: unknown): string => {
  if (!label) return '';
  if (typeof label === 'string') return label;
  if (typeof label === 'object') {
    const obj = label as Record<string, any>;
    return obj.name || obj.en || obj.ar || obj.value || '';
  }
  return String(label);
};

export function useInventory() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = i18n.language === 'ar';
  const lowStockThreshold = useInventorySettingsStore(
    (s) => s.lowStockThreshold
  );

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // URL search params as the source of truth for UI state (0 useEffect!)
  const search = searchParams.get('search') || '';
  const activeTab = (searchParams.get('status') || 'all') as FilterKey;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Keep track of unsaved local stock edits in a ref and local state for instant re-render
  const pendingChanges = useRef<
    Record<string, { productId: string; variantId: string; stock: number }>
  >({});
  const [pendingStock, setPendingStock] = useState<Record<string, number>>({});

  // Compute minStock/maxStock and stockStatus from activeTab
  let minStock: number | undefined = undefined;
  let maxStock: number | undefined = undefined;
  let stockStatus: InventoryStockStatus | undefined = undefined;

  if (activeTab === 'Out of Stock') {
    minStock = 0;
    maxStock = 0;
    stockStatus = 'outOfStock';
  } else if (activeTab === 'Low Stock') {
    minStock = 1;
    maxStock = lowStockThreshold;
    stockStatus = 'lowStock';
  } else if (activeTab === 'In Stock') {
    minStock = lowStockThreshold + 1;
    maxStock = undefined;
    stockStatus = 'inStock';
  }

  // Query real inventory from the API with dependencies
  const { data: rawInventory } = useQuery({
    queryKey: [
      'inventory',
      currentPage,
      activeTab,
      search,
      lowStockThreshold,
      stockStatus,
    ],
    queryFn: () =>
      getVendorInventory({
        pageNum: currentPage,
        pageSize: ITEMS_PER_PAGE,
        search: search || undefined,
        minStock,
        maxStock,
        stockStatus,
      }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Convert raw product variants to flat rows
  const rows: ProductRow[] = useMemo(() => {
    const items = rawInventory?.items || [];
    return [...items]
      .filter((item) => {
        // Filter against original backend stock so rows stay in current tab while editing pending values
        const originalStock = typeof item.stock === 'number' ? item.stock : 0;
        if (activeTab === 'Out of Stock') return originalStock === 0;
        if (activeTab === 'Low Stock')
          return originalStock >= 1 && originalStock <= lowStockThreshold;
        if (activeTab === 'In Stock') return originalStock > lowStockThreshold;
        return true;
      })
      .sort((a, b) => {
        const timeA = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
        const timeB = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
        const safeA = isNaN(timeA) ? 0 : timeA;
        const safeB = isNaN(timeB) ? 0 : timeB;
        return safeB - safeA;
      })
      .map((item) => {
        const uniqueId = `${item.productId}::${item.variantId}`;
        const name = isAr
          ? item.productNameAr || item.productName || ''
          : item.productName || item.productNameAr || '';

        const labelEn = resolveLabel(item.labelName);
        const labelAr = resolveLabel(item.labelNameAr);

        const variantStr = isAr
          ? labelAr || labelEn || t('inventoryPage.defaultVariant', 'الافتراضي')
          : labelEn || labelAr || t('inventoryPage.defaultVariant', 'Default');

        const updatedAt = item.lastUpdatedAt
          ? new Date(item.lastUpdatedAt).toLocaleDateString(
              isAr ? 'ar-EG' : 'en-US'
            )
          : '';

        // Display pending stock edit if user modified it, otherwise original backend stock
        const stock =
          pendingStock[uniqueId] !== undefined
            ? pendingStock[uniqueId]
            : typeof item.stock === 'number'
              ? item.stock
              : 0;

        return {
          id: uniqueId,
          name,
          sku: item.sku || '',
          variant: variantStr,
          stock,
          updatedAt,
          status: getStatus(stock, lowStockThreshold),
        };
      });
  }, [rawInventory, isAr, activeTab, pendingStock, lowStockThreshold, t]);

  // Derived data
  const totalItems = rawInventory?.pagination?.totalItems || 0;
  const totalPages =
    rawInventory?.pagination?.totalPages ||
    (rawInventory?.pagination?.totalItems
      ? Math.ceil(rawInventory.pagination.totalItems / ITEMS_PER_PAGE)
      : 0);
  const paginatedData = rows;

  // Prefetch the next page data in background
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: [
          'inventory',
          nextPage,
          activeTab,
          search,
          lowStockThreshold,
          stockStatus,
        ],
        queryFn: () =>
          getVendorInventory({
            pageNum: nextPage,
            pageSize: ITEMS_PER_PAGE,
            search: search || undefined,
            minStock,
            maxStock,
            stockStatus,
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
    stockStatus,
    lowStockThreshold,
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

  // Stock change modifies ref and local state for immediate UI feedback without mutating query cache
  const handleStockChange = (id: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const [productId, variantId] = id.split('::');

    pendingChanges.current[id] = { productId, variantId, stock: num };
    setPendingStock((prev) => ({ ...prev, [id]: num }));
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
      setPendingStock({});
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      queryClient.invalidateQueries({ queryKey: ['product-details'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryProductsMap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardTopSellingProducts'] });
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

  const {
    handleExportAll,
    handleExportFiltered,
    isExporting,
    hasActiveFilter,
  } = useInventoryExport({
    pendingStock,
    search,
    activeTab,
    minStock,
    maxStock,
  });

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
    // Export
    handleExportAll,
    handleExportFiltered,
    isExporting,
    hasActiveFilter,
    // Import Modal
    isImportModalOpen,
    setIsImportModalOpen,
    openImportModal: () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
  };
}

