import { useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../types/api';
import type { Product, ProductStatus } from './mangement';
import {
  searchVendorProducts,
  bulkUpdateProductStatus,
  downloadProductImportTemplate,
  importProducts,
  exportProducts,
  type ProductImportResponse,
  type ExportProductsParams,
} from '../../services/products';
import { getVendorReviews } from '../../services/reviews';
import { useManagementStore } from './managementStore';
import { resolveImageUrl } from '../../utils/image';
import { exportToXLSX } from '../../utils/exportUtils';

const ITEMS_PER_PAGE = 8;
const FETCH_PAGE_SIZE = 100;

const cleanId = (str: any) =>
  String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '');

export function useManagementTable() {
  const queryClient = useQueryClient();
  const selectedCategories = useManagementStore(
    (state) => state.selectedCategories
  );
  const selectedStatus = useManagementStore((state) => state.selectedStatus);
  const search = useManagementStore((state) => state.search);
  const page = useManagementStore((state) => state.page);
  const selectedRows = useManagementStore((state) => state.selectedRows);
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ['products-manage', 1],
    queryFn: () =>
      searchVendorProducts({ pageNum: 1, pageSize: FETCH_PAGE_SIZE }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: rawReviews } = useQuery({
    queryKey: ['vendor-reviews-manage'],
    queryFn: () => getVendorReviews({ pageSize: 100 }),
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const reviewsMap = useMemo(() => {
    const items = rawReviews?.items || (Array.isArray(rawReviews) ? rawReviews : []);
    const map: Record<string, { totalRating: number; count: number }> = {};

    for (const r of items) {
      if (!r) continue;
      const pidRaw =
        r.productId ||
        r.product_id ||
        r.targetId ||
        (typeof r.product === 'object' ? r.product?.id || r.product?._id : r.product) ||
        (typeof r.orderItem === 'object' ? r.orderItem?.productId || r.orderItem?.product?.id : '') ||
        '';

      const key = cleanId(pidRaw);
      if (!key) continue;

      const ratingVal = Number(r.rating ?? r.score ?? r.stars ?? 0);

      if (!map[key]) {
        map[key] = { totalRating: 0, count: 0 };
      }
      if (!isNaN(ratingVal) && ratingVal > 0) {
        map[key].totalRating += ratingVal;
        map[key].count += 1;
      }
    }

    return map;
  }, [rawReviews]);

  // Prefetch the next page of products from backend in the background
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['products-manage', 2],
      queryFn: () =>
        searchVendorProducts({ pageNum: 2, pageSize: FETCH_PAGE_SIZE }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const products: Product[] = useMemo(() => {
    const items =
      rawProducts?.items || (Array.isArray(rawProducts) ? rawProducts : []);
    return items.map((p: any) => {
      // Determine product status (Published / Unpublished / Disabled)
      let status: ProductStatus = 'Published';
      if (p.isDisabled || p.status === 'DISABLED' || p.status === 'Disabled') {
        status = 'Disabled';
      } else if (
        p.isActive === false ||
        p.enabled === false ||
        p.status === 'UNPUBLISHED' ||
        p.status === 'Unpublished' ||
        p.status === 'INACTIVE' ||
        p.status === 'Inactive'
      ) {
        status = 'Unpublished';
      } else {
        status = 'Published';
      }

      const catObj = p.category || {};
      const categoryId = p.categoryId || catObj.id || '';
      const categoryName = isArabic
        ? catObj.nameAr || catObj.name || ''
        : catObj.name || catObj.nameAr || '';

      let parsedPrice = 0;
      if (typeof p.minPrice === 'number') {
        parsedPrice = p.minPrice;
      } else if (p.minPrice && typeof p.minPrice === 'object') {
        parsedPrice = Number(
          (p.minPrice as any).amount || (p.minPrice as any).value || 0
        );
      } else if (typeof p.compareAtPrice === 'number') {
        parsedPrice = p.compareAtPrice;
      } else if (typeof p.price === 'number') {
        parsedPrice = p.price;
      }

      const pIdRaw = p.id || p._id || p.productId || '';
      const pKey = cleanId(pIdRaw);
      const revStats = reviewsMap[pKey];
      const aggregatedRating =
        revStats && revStats.count > 0
          ? Number((revStats.totalRating / revStats.count).toFixed(1))
          : 0;
      const aggregatedCount = revStats ? revStats.count : 0;

      const rawProductRating = Number(
        p.rating ??
        p.averageRating ??
        p.ratingSummary?.averageRating ??
        p.ratingSummary?.rating ??
        0
      );
      const rating =
        !isNaN(rawProductRating) && rawProductRating > 0
          ? Number(rawProductRating.toFixed(1))
          : aggregatedRating;

      const rawProductCount = Number(
        p.ratingCount ??
        p.reviewsCount ??
        p.totalRatings ??
        p.totalReviews ??
        p.ratingSummary?.totalRatings ??
        p.ratingSummary?.totalReviews ??
        p.ratingSummary?.count ??
        0
      );
      const ratingCount =
        !isNaN(rawProductCount) && rawProductCount > 0
          ? rawProductCount
          : aggregatedCount;

      let iconUrl = '';
      if (typeof p.thumbnailUrl === 'string') {
        iconUrl = p.thumbnailUrl;
      } else if (p.thumbnailUrl && typeof p.thumbnailUrl === 'object') {
        iconUrl =
          (p.thumbnailUrl as any).url || (p.thumbnailUrl as any).src || '';
      } else if (Array.isArray(p.images) && p.images.length > 0) {
        const thumb =
          p.images.find((img: any) => img.isThumbnail) || p.images[0];
        iconUrl =
          typeof thumb === 'string' ? thumb : thumb.url || thumb.src || '';
      }

      if (iconUrl) {
        iconUrl = resolveImageUrl(iconUrl, '');
      }

      return {
        id: p.id || p._id || p.productId || '',
        name: isArabic ? p.nameAr || p.name || '' : p.name || p.nameAr || '',
        category: categoryId,
        categoryName,
        price: parsedPrice,
        rating,
        ratingCount,
        status,
        enabled: status === 'Published',
        isDisabled: status === 'Disabled' || Boolean(p.isDisabled),
        icon: iconUrl || 'ti-package',
        createdAt: p.createdAt || p.created_at || p.updatedAt || '',
        updatedAt: p.updatedAt || p.updated_at || '',
      } as Product;
    }).sort((a: Product, b: Product) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const safeA = isNaN(timeA) ? 0 : timeA;
      const safeB = isNaN(timeB) ? 0 : timeB;
      return safeB - safeA;
    });
  }, [rawProducts, isArabic, reviewsMap]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (
        search &&
        !product.name.toLowerCase().includes(search.toLowerCase())
      ) {
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

  const selectablePaginatedProducts = paginatedProducts.filter(
    (p) => !p.isDisabled && p.status !== 'Disabled'
  );
  const allChecked =
    selectablePaginatedProducts.length > 0 &&
    selectablePaginatedProducts.every((product) =>
      selectedRows.some((rowId) => String(rowId) === String(product.id))
    );
  const isIndeterminate =
    !allChecked &&
    selectablePaginatedProducts.some((product) =>
      selectedRows.some((rowId) => String(rowId) === String(product.id))
    );

  const exportMutation = useExportProducts();

  const handleExport = () => {
    const singleCat =
      selectedCategories.length === 1 && selectedCategories[0] !== 'all'
        ? selectedCategories[0]
        : undefined;

    const isActive =
      selectedStatus === 'Published'
        ? true
        : selectedStatus === 'Unpublished' || selectedStatus === 'Disabled'
        ? false
        : undefined;

    exportMutation.mutate({
      categoryId: singleCat,
      isActive,
      fallbackProducts: filteredProducts.length > 0 ? filteredProducts : products,
    });
  };

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
    allChecked,
    isIndeterminate,
    exportMutation,
    handleExport,
    isExporting: exportMutation.isPending,
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
      status: 'PUBLISH' | 'UNPUBLISH';
    }) => bulkUpdateProductStatus(params),
    onSuccess: (_, variables) => {
      if (variables.status === 'PUBLISH') {
        toast.success('Published successfully!');
      } else {
        toast.success('Unpublished successfully!');
      }
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['product-details'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardTopSellingProducts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryProductsMap'] });

      variables.productIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['product', id] });
        queryClient.invalidateQueries({ queryKey: ['product-details', id] });
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Action failed'));
    },
  });

  const safeMutate = (params: {
    productIds: string[];
    status: 'PUBLISH' | 'UNPUBLISH';
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
    toggleSingle: (id: string | number, currentEnabled: boolean) =>
      safeMutate({
        productIds: [String(id)],
        status: currentEnabled ? 'UNPUBLISH' : 'PUBLISH',
      }),
    isPending: bulkStatusMutation.isPending,
  };
}

export function useDownloadImportTemplate() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: () => downloadProductImportTemplate(),
    onSuccess: () => {
      toast.success(
        t(
          'managementTable.importModal.downloadSuccess',
          'Template downloaded successfully'
        )
      );
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          t(
            'managementTable.importModal.downloadError',
            'Failed to download template'
          )
        )
      );
    },
  });
}

export function useImportProducts() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (file: File) => importProducts(file),
    onSuccess: (data: ProductImportResponse) => {
      if (data?.created > 0) {
        queryClient.invalidateQueries({ queryKey: ['products-manage'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({
          queryKey: ['dashboardTopSellingProducts'],
        });
        queryClient.invalidateQueries({
          queryKey: ['dashboardInventoryAlerts'],
        });
        queryClient.invalidateQueries({
          queryKey: ['dashboardInventoryProductsMap'],
        });
      }
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          t('managementTable.importModal.importError', 'Failed to import products')
        )
      );
    },
  });
}

export function useExportProducts() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return useMutation({
    mutationFn: async (
      params?: ExportProductsParams & { fallbackProducts?: Product[] }
    ) => {
      try {
        return await exportProducts({
          categoryId: params?.categoryId,
          isActive: params?.isActive,
        });
      } catch (err) {
        console.warn(
          'Backend export /vendor/products/export failed, trying fallback client export:',
          err
        );
        const fallbackList = params?.fallbackProducts || [];
        if (fallbackList.length > 0) {
          const exportHeaders = [
            { key: 'id', label: isAr ? 'معرف المنتج' : 'Product ID' },
            { key: 'name', label: isAr ? 'اسم المنتج' : 'Product Name' },
            { key: 'categoryName', label: isAr ? 'الفئة' : 'Category' },
            { key: 'price', label: isAr ? 'السعر (ر.س)' : 'Price (SAR)' },
            { key: 'rating', label: isAr ? 'التقييم' : 'Rating' },
            { key: 'status', label: isAr ? 'الحالة' : 'Status' },
            { key: 'enabled', label: isAr ? 'مفعل' : 'Enabled' },
          ];
          await exportToXLSX('products_export', exportHeaders, fallbackList);
          return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(
        isAr
          ? 'تم تصدير المنتجات بنجاح'
          : t('managementTable.exportSuccess', 'Products exported successfully')
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (isAr
          ? 'فشل تصدير المنتجات'
          : t('managementTable.exportError', 'Failed to export products'));
      toast.error(msg);
    },
  });
}

