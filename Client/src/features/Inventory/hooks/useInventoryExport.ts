import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  exportVendorInventory,
  fetchAllVendorInventoryVariants,
} from '../../../services/inventory';
import { exportToXLSX } from '../../../utils/exportUtils';
import { getErrorMessage } from '../../../types/api';
import { getStatus } from '../utils';
import type { FilterKey } from '../constants';
import { useInventorySettingsStore } from '../../../store/inventorySettingsStore';

interface UseInventoryExportParams {
  pendingStock: Record<string, number>;
  search: string;
  activeTab: FilterKey;
  minStock?: number;
  maxStock?: number;
}

export function useInventoryExport({
  pendingStock,
  search,
  activeTab,
  minStock,
  maxStock,
}: UseInventoryExportParams) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const lowStockThreshold = useInventorySettingsStore(
    (s) => s.lowStockThreshold
  );

  const hasActiveFilter = activeTab !== 'all' || !!search.trim();

  const exportMutation = useMutation({
    mutationFn: async ({ scope }: { scope: 'all' | 'filtered' }) => {
      // For exporting all items, use the official server endpoint which generates
      // the formatted Excel sheet with yellow Stock column and SUM formulas
      if (scope === 'all') {
        try {
          await exportVendorInventory();
          return;
        } catch (serverErr) {
          console.warn(
            'Server inventory export failed, falling back to local exporter:',
            serverErr
          );
        }
      }

      const isFiltered = scope === 'filtered' && hasActiveFilter;

      const queryFilter = isFiltered
        ? {
            search: search.trim() || undefined,
            minStock,
            maxStock,
          }
        : undefined;

      const allItems = await fetchAllVendorInventoryVariants(queryFilter);

      if (!allItems || allItems.length === 0) {
        toast.error(
          t(
            'inventoryPage.exportNoData',
            'No inventory variants found to export'
          )
        );
        return;
      }

      // Format data rows with pending changes and localized labels
      const exportData = allItems.map((item) => {
        const uniqueId = `${item.productId}::${item.variantId}`;
        const productName = isAr
          ? item.productNameAr || item.productName || ''
          : item.productName || item.productNameAr || '';

        const variant = isAr
          ? item.labelNameAr ||
            item.labelName ||
            t('inventoryPage.defaultVariant', 'الافتراضي')
          : item.labelName ||
            item.labelNameAr ||
            t('inventoryPage.defaultVariant', 'Default');

        const stock =
          pendingStock[uniqueId] !== undefined
            ? pendingStock[uniqueId]
            : typeof item.stock === 'number'
              ? item.stock
              : 0;

        const statusKey = getStatus(stock, lowStockThreshold);
        const statusLabel =
          statusKey === 'In Stock'
            ? t('inventoryPage.inStock', 'In Stock')
            : statusKey === 'Low Stock'
              ? t('inventoryPage.lowStock', 'Low Stock')
              : t('inventoryPage.outOfStock', 'Out of Stock');

        const updatedAt = item.lastUpdatedAt
          ? new Date(item.lastUpdatedAt).toLocaleDateString(
              isAr ? 'ar-EG' : 'en-US'
            )
          : '';

        return {
          productName,
          sku: item.sku || '',
          variant,
          stock,
          status: statusLabel,
          updatedAt,
          productId: item.productId,
          variantId: item.variantId,
        };
      });

      const headers = [
        {
          key: 'productName',
          label: t('inventoryPage.colProductName', 'Product Name'),
        },
        { key: 'sku', label: t('inventoryPage.colSku', 'SKU') },
        {
          key: 'variant',
          label: t('inventoryPage.colVariant', 'Variant'),
        },
        {
          key: 'stock',
          label: t('inventoryPage.colCurrentStock', 'Current Stock'),
        },
        {
          key: 'status',
          label: t('inventoryPage.colStatus', 'Status'),
        },
        {
          key: 'updatedAt',
          label: t('inventoryPage.colLastUpdated', 'Last Updated'),
        },
        {
          key: 'productId',
          label: t('inventoryPage.colProductId', 'Product ID'),
        },
        {
          key: 'variantId',
          label: t('inventoryPage.colVariantId', 'Variant ID'),
        },
      ];

      const baseName = isFiltered
        ? 'inventory_variants_filtered'
        : 'inventory_variants_all';

      await exportToXLSX(baseName, headers, exportData);
    },
    onSuccess: () => {
      toast.success(
        t(
          'inventoryPage.exportSuccess',
          'Inventory variants exported successfully'
        )
      );
    },
    onError: (err: unknown) => {
      console.error('Failed to export inventory variants:', err);
      toast.error(
        getErrorMessage(
          err,
          t('inventoryPage.exportError', 'Failed to export inventory')
        )
      );
    },
  });

  return {
    handleExportAll: () => exportMutation.mutate({ scope: 'all' }),
    handleExportFiltered: () => exportMutation.mutate({ scope: 'filtered' }),
    isExporting: exportMutation.isPending,
    hasActiveFilter,
  };
}
