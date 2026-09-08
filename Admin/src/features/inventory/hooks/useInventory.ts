import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../types/api';
import {
  ITEMS_PER_PAGE,
  type ProductRow,
  type InventoryVendorOption,
} from '../types';
import { getStatus } from '../utils';
import type { FilterKey } from '../constants';
import {
  getAdminInventory,
  bulkUpdateVariantStock,
  exportAdminInventory,
  downloadInventoryExport,
  importAdminInventory,
} from '../../../services/inventory';
import { getVendors } from '../../../services/vendors';

export function useInventory() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = i18n.language === 'ar';

  // URL search params as the source of truth for UI state
  const search = searchParams.get('search') || '';
  const activeTab = (searchParams.get('status') || 'all') as FilterKey;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const vendorId = searchParams.get('vendorId') || '';

  // Vendor list for the "filter by vendor" dropdown
  const { data: vendorsResp, isLoading: isVendorsLoading } = useQuery({
    queryKey: ['inventory-vendors'],
    queryFn: () => getVendors({ pageSize: 100 }),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const vendorOptions: InventoryVendorOption[] = useMemo(
    () =>
      (vendorsResp?.items || []).map((v) => ({
        id: v.id,
        name:
          v.storeName ||
          [v.firstName, v.lastName].filter(Boolean).join(' ').trim() ||
          v.id,
      })),
    [vendorsResp]
  );

  // Fallback lookup: resolve a vendor's display name from its id when the
  // inventory API response doesn't embed storeName on the item.
  const vendorNameById = useMemo(() => {
    const map = new Map<string, string>();
    vendorOptions.forEach((v) => map.set(v.id, v.name));
    return map;
  }, [vendorOptions]);

  // Keep track of unsaved local stock edits in a ref and local state for instant re-render
  const pendingChanges = useRef<
    Record<string, { productId: string; variantId: string; stock: number }>
  >({});
  const [pendingStock, setPendingStock] = useState<Record<string, number>>({});

  // Compute minStock/maxStock/stockStatus from activeTab
  let minStock: number | undefined = undefined;
  let maxStock: number | undefined = undefined;
  let stockStatus: 'inStock' | 'lowStock' | 'outOfStock' | undefined = undefined;

  if (activeTab === 'Out of Stock') {
    minStock = 0;
    maxStock = 0;
    stockStatus = 'outOfStock';
  } else if (activeTab === 'Low Stock') {
    minStock = 1;
    maxStock = 5;
    stockStatus = 'lowStock';
  } else if (activeTab === 'In Stock') {
    minStock = 6;
    maxStock = undefined;
    stockStatus = 'inStock';
  }

  // Query real inventory from the API with dependencies
  const { data: rawInventory, isLoading } = useQuery({
    queryKey: ['inventory', currentPage, activeTab, search, vendorId],
    queryFn: () =>
      getAdminInventory({
        pageNum: currentPage,
        pageSize: ITEMS_PER_PAGE,
        search: search || undefined,
        vendorId: vendorId || undefined,
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
    // Mirror the vendor filter client-side only when it's safe: the API returns a
    // vendorId on items AND at least one row matches the selection. Otherwise
    // (no vendorId field, or an id-space mismatch) trust the server response.
    const canClientFilterVendor =
      !!vendorId && items.some((it) => it.vendorId === vendorId);
    return [...items]
      .filter((item) => {
        // Filter against original backend stock so rows stay in current tab while editing pending values
        const originalStock = typeof item.stock === 'number' ? item.stock : 0;
        if (activeTab === 'Out of Stock') return originalStock === 0;
        if (activeTab === 'Low Stock') return originalStock >= 1 && originalStock <= 5;
        if (activeTab === 'In Stock') return originalStock > 5;
        return true;
      })
      .filter((item) =>
        canClientFilterVendor ? item.vendorId === vendorId : true
      )
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

        const variantStr = isAr
          ? item.labelNameAr || item.labelName || 'الافتراضي'
          : item.labelName || item.labelNameAr || 'Default';

        const vendorName =
          (isAr
            ? item.storeNameAr || item.storeName
            : item.storeName || item.storeNameAr) ||
          vendorNameById.get(item.vendorId || '') ||
          '';

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
          vendor: vendorName,
          vendorId: item.vendorId || '',
          sku: item.sku || '',
          variant: variantStr,
          stock,
          updatedAt,
          status: getStatus(stock),
        };
      });
  }, [rawInventory, isAr, activeTab, pendingStock, vendorId, vendorNameById]);

  // Derived data
  const totalItems = rawInventory?.pagination?.totalItems || 0;
  const totalPages = rawInventory?.pagination?.totalPages || 0;
  const paginatedData = rows;

  // Prefetch the next page data in background
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ['inventory', nextPage, activeTab, search, vendorId],
        queryFn: () =>
          getAdminInventory({
            pageNum: nextPage,
            pageSize: ITEMS_PER_PAGE,
            search: search || undefined,
            vendorId: vendorId || undefined,
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
    vendorId,
    minStock,
    maxStock,
    stockStatus,
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

  const handleVendorChange = (id: string) => {
    setSearchParams((prev) => {
      if (!id) {
        prev.delete('vendorId');
      } else {
        prev.set('vendorId', id);
      }
      prev.set('page', '1');
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
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
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

  // Export the current (filtered) inventory to an Excel file via the API
  const exportMutation = useMutation({
    mutationFn: () =>
      exportAdminInventory({
        search: search || undefined,
        vendorId: vendorId || undefined,
        minStock,
        maxStock,
        stockStatus,
      }),
    onSuccess: (file) => {
      downloadInventoryExport(file);
      toast.success(
        t('inventoryPage.exportSuccess', 'Inventory exported successfully!')
      );
    },
    onError: (err: unknown) => {
      console.error('Failed to export inventory:', err);
      toast.error(
        getErrorMessage(
          err,
          t('inventoryPage.exportFailed', 'Failed to export inventory.')
        )
      );
    },
  });

  const handleExport = () => {
    if (exportMutation.isPending) return;
    exportMutation.mutate();
  };

  // Import stock updates from an uploaded Excel/CSV file, then refresh the table
  const importMutation = useMutation({
    mutationFn: (file: File) => importAdminInventory(file),
    onSuccess: (result) => {
      // Server data changed — drop any unsaved local edits so the table shows the truth
      pendingChanges.current = {};
      setPendingStock({});
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });

      toast.success(
        t('inventoryPage.importSuccess', 'Inventory updated from file!')
      );
      const failed = Number(result?.failed) || 0;
      if (failed > 0) {
        toast.error(
          `${failed} ${t(
            'inventoryPage.importFailedRows',
            'row(s) could not be imported.'
          )}`
        );
      }
    },
    onError: (err: unknown) => {
      const status = (err as { statusCode?: number })?.statusCode;
      console.error('Failed to import inventory:', status ?? '', err);
      const message = getErrorMessage(
        err,
        t('inventoryPage.importFailed', 'Failed to import file.')
      );
      toast.error(status ? `${message} (${status})` : message);
    },
  });

  const handleImport = (file: File) => {
    if (importMutation.isPending) return;
    importMutation.mutate(file);
  };

  return {
    search,
    activeTab,
    currentPage,
    vendorId,
    vendorOptions,
    isVendorsLoading,
    paginatedData,
    totalItems,
    totalPages,
    pageNumbers,
    isLoading,
    handleFilterChange,
    handleSearchChange,
    handleStockChange,
    handlePageChange,
    handleVendorChange,
    handleSave,
    isSaving: saveMutation.isPending,
    handleExport,
    isExporting: exportMutation.isPending,
    handleImport,
    isImporting: importMutation.isPending,
  };
}
