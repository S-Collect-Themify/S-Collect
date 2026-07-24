import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../types/api';
import { ITEMS_PER_PAGE, type ProductRow } from '../types';
import { getStatus } from '../utils';
import type { FilterKey } from '../constants';
import { getAllProducts, updateProductVariant } from '../../../services/products';

export function useInventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search params as the source of truth for UI state (0 useState, 0 useEffect!)
  const search = searchParams.get('search') || '';
  const activeTab = (searchParams.get('status') || 'all') as FilterKey;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Keep track of unsaved local stock edits in a ref
  const pendingChanges = useRef<Record<string, { productId: string; variantId: string; stock: number }>>({});

  // Query real products from the API
  const { data: rawProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract products array from response envelope
  const products = useMemo(() => {
    const responseData = rawProducts;
    const productsEnvelope = responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData
      ? responseData.data
      : responseData;
    
    return Array.isArray(productsEnvelope)
      ? productsEnvelope
      : (productsEnvelope && typeof productsEnvelope === 'object' && 'items' in productsEnvelope && Array.isArray(productsEnvelope.items)
        ? productsEnvelope.items
        : []);
  }, [rawProducts]);

  // Convert raw products & their variants to flat rows
  const rows: ProductRow[] = useMemo(() => {
    const mappedRows: ProductRow[] = [];
    products.forEach((p: any) => {
      const name = p.name || '';
      const productId = String(p.id);
      const updatedAt = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '';

      if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          // Format option values string, e.g. "M / Blue"
          const variantStr = v.optionValues && Array.isArray(v.optionValues)
            ? v.optionValues.map((ov: any) => ov.value || ov.valueAr).filter(Boolean).join(' / ')
            : '';
          
          const uniqueId = `${productId}::${v.id}`;
          // Use pending change stock if user edited it, otherwise backend stock
          const stock = pendingChanges.current[uniqueId] !== undefined
            ? pendingChanges.current[uniqueId].stock
            : (v.stock || 0);

          mappedRows.push({
            id: uniqueId,
            name,
            sku: v.sku || p.sku || '',
            variant: variantStr || 'Default',
            stock,
            updatedAt,
            status: getStatus(stock),
          });
        });
      } else {
        // Fallback for product summary items without variants
        const uniqueId = `${productId}::default`;
        const stock = pendingChanges.current[uniqueId] !== undefined
          ? pendingChanges.current[uniqueId].stock
          : (p.stock || 0);

        mappedRows.push({
          id: uniqueId,
          name,
          sku: p.sku || '',
          variant: 'Default',
          stock,
          updatedAt,
          status: getStatus(stock),
        });
      }
    });
    return mappedRows;
  }, [products]);

  // Filter data (by active tab and search query)
  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const matchTab = activeTab === 'all' || p.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.variant.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [rows, search, activeTab]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

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
    queryClient.setQueryData(['products'], (old: any) => {
      if (!old) return old;
      
      const isEnveloped = old && typeof old === 'object' && 'success' in old && 'data' in old;
      const rawData = isEnveloped ? old.data : old;
      const isPaginated = rawData && typeof rawData === 'object' && 'items' in rawData;
      const items = isPaginated ? rawData.items : (Array.isArray(rawData) ? rawData : []);

      const updatedItems = items.map((product: any) => {
        if (String(product.id) === productId) {
          if (product.variants && Array.isArray(product.variants)) {
            const updatedVariants = product.variants.map((v: any) => {
              if (String(v.id) === variantId) {
                return { ...v, stock: num };
              }
              return v;
            });
            return { ...product, variants: updatedVariants };
          }
          return { ...product, stock: num };
        }
        return product;
      });

      if (isEnveloped) {
        return {
          ...old,
          data: isPaginated
            ? { ...old.data, items: updatedItems }
            : updatedItems
        };
      } else {
        return isPaginated
          ? { ...old, items: updatedItems }
          : updatedItems;
      }
    });
  };

  // Mutation to save stock modifications in batch
  const saveMutation = useMutation({
    mutationFn: async (changesList: { productId: string; variantId: string; stock: number }[]) => {
      // Filter out 'default' variant IDs and call patch accordingly
      return Promise.all(
        changesList.map(({ productId, variantId, stock }) => {
          const vId = variantId === 'default' ? '' : variantId;
          return updateProductVariant(productId, vId, { stock });
        })
      );
    },
    onSuccess: () => {
      toast.success(t('inventoryPage.saveSuccess', 'Changes saved successfully!'));
      pendingChanges.current = {};
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      console.error('Failed to save stock changes:', err);
      toast.error(
        getErrorMessage(err, t('inventoryPage.saveFailed', 'Failed to save changes.'))
      );
    },
  });

  const handleSave = async () => {
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
