import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getAdminProducts,
  getAdminVendors,
  getCategories,
  updateProductStatus,
  applyBulkDiscountApi,
  exportAdminProducts,
  type ExportAdminProductsParams,
  type BulkDiscountPayload,
} from '../../services/products';
import { exportToXLSX } from '../../utils/exportUtils';
import { useProductStore } from './productStore';
import type { ProductItem } from './types';

const extractProductsArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.products)) return response.products;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
    }
  }
  return [];
};

const extractVendorsArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.vendors)) return response.vendors;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data.vendors)) return response.data.vendors;
    }
  }
  return [];
};

const getVendorDisplayName = (
  vId: string | undefined,
  vendorsList: any[],
  vendorProp: any,
  item?: any,
  isAr?: boolean
): string => {
  if (item) {
    if (isAr && item.vendorStoreNameAr) return item.vendorStoreNameAr;
    if (item.vendorStoreName) return item.vendorStoreName;
    if (isAr && item.vendorNameAr) return item.vendorNameAr;
    if (item.vendorName) return item.vendorName;
  }
  if (vendorProp) {
    if (typeof vendorProp === 'string') return vendorProp;
    if (isAr && vendorProp.storeNameAr) return vendorProp.storeNameAr;
    if (vendorProp.storeName) return vendorProp.storeName;
    if (vendorProp.businessName) return vendorProp.businessName;
    if (vendorProp.name) return vendorProp.name;
    if (vendorProp.firstName || vendorProp.lastName) {
      return `${vendorProp.firstName || ''} ${vendorProp.lastName || ''}`.trim();
    }
  }
  if (vId && vendorsList.length > 0) {
    const matched = vendorsList.find(
      (v: any) =>
        String(v.id || v._id).toLowerCase() === String(vId).toLowerCase()
    );
    if (matched) {
      if (isAr && matched.storeNameAr) return matched.storeNameAr;
      if (matched.storeName) return matched.storeName;
      if (matched.businessName) return matched.businessName;
      if (matched.name) return matched.name;
      if (matched.owner) return matched.owner;
      if (matched.firstName || matched.lastName) {
        return `${matched.firstName || ''} ${matched.lastName || ''}`.trim();
      }
    }
  }
  if (vId) return `Vendor (${String(vId).slice(0, 8)})`;
  return '—';
};

const isProductActive = (p: any): boolean => {
  if (p.isDisabled !== undefined && p.isDisabled !== null) {
    if (typeof p.isDisabled === 'boolean') return !p.isDisabled;
    if (typeof p.isDisabled === 'string')
      return p.isDisabled.toLowerCase() !== 'true';
    if (typeof p.isDisabled === 'number') return p.isDisabled === 0;
  }
  if (p.isActive !== undefined && p.isActive !== null) {
    if (typeof p.isActive === 'boolean') return p.isActive;
    if (typeof p.isActive === 'string')
      return p.isActive.toLowerCase() === 'true';
  }
  return true;
};

export const useProductsData = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const setProducts = useProductStore((s) => s.setProducts);
  const toggleProductStatusInStore = useProductStore(
    (s) => s.toggleProductStatus
  );
  const closeDisableModal = useProductStore((s) => s.closeDisableModal);

  // ── Fetch Products Query ──
  const productsQuery = useQuery({
    queryKey: ['products', isAr ? 'ar' : 'en'],
    queryFn: async () => {
      try {
        const [productsRes, vendorsRes, categoriesRes] = await Promise.allSettled([
          getAdminProducts(),
          getAdminVendors(),
          getCategories(),
        ]);

        const prodData =
          productsRes.status === 'fulfilled' ? productsRes.value : null;
        const vendData =
          vendorsRes.status === 'fulfilled' ? vendorsRes.value : null;
        const catData =
          categoriesRes.status === 'fulfilled' ? categoriesRes.value : null;

        const itemsArray = extractProductsArray(prodData);
        const vendorsList = extractVendorsArray(vendData);
        const categoriesList: any[] = Array.isArray(catData)
          ? catData
          : (catData as any)?.data || (catData as any)?.items || [];

        const mapped: ProductItem[] = itemsArray.map((p: any) => {
          const vId = p.vendorId || p.vendor?.id;
          const vName = getVendorDisplayName(vId, vendorsList, p.vendor, p, isAr);

          const catObj = typeof p.category === 'object' && p.category !== null ? p.category : null;
          const catId = p.categoryId || p.category_id || catObj?.id || catObj?._id || (typeof p.category === 'string' ? p.category : '');

          const matchedCat = categoriesList.find((c: any) =>
            (catId && (String(c.id || c._id) === String(catId) || String(c.slug) === String(catId))) ||
            (c.name && catObj?.name && String(c.name).toLowerCase() === String(catObj.name).toLowerCase()) ||
            (typeof p.category === 'string' && (String(c.id || c._id) === p.category || String(c.name).toLowerCase() === p.category.toLowerCase()))
          );

          const categoryName =
            catObj?.name ||
            matchedCat?.name ||
            (typeof p.category === 'string' ? p.category : 'General');
          const categoryNameAr =
            catObj?.nameAr ||
            catObj?.name_ar ||
            p.categoryAr ||
            p.category_ar ||
            p.categoryNameAr ||
            matchedCat?.nameAr ||
            matchedCat?.name_ar ||
            '';

          return {
            id: p.id || p._id,
            name: p.name || p.title || 'Product',
            nameAr: p.nameAr || p.titleAr,
            vendor: vName,
            vendorId: vId,
            category: categoryName,
            categoryAr: categoryNameAr,
            price: Number(p.minPrice ?? p.price ?? 0),
            totalStock: p.totalStock !== undefined && p.totalStock !== null ? p.totalStock : '',
            isActive: isProductActive(p),
            image:
              p.thumbnailUrl ||
              p.images?.[0]?.url ||
              p.image ||
              p.thumbnail ||
              '',
            discountPercent:
              typeof p.discountPercent === 'number'
                ? p.discountPercent
                : typeof p.discountPercent === 'string'
                ? Number(p.discountPercent) || 0
                : 0,
          };
        });

        setProducts(mapped);
        return mapped;
      } catch (e) {
        console.warn('API products query error:', e);
        setProducts([]);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Fetch Categories Query ──
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });

  // ── Toggle Status Mutation ──
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string | number;
      isActive: boolean;
    }) => {
      return await updateProductStatus(id, isActive);
    },
    onMutate: async ({ id, isActive }) => {
      toggleProductStatusInStore(id, isActive);
      closeDisableModal();
    },
    onSuccess: () => {
      toast.success('Product status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product-details'] });
    },
    onError: (_err, { id, isActive }) => {
      toggleProductStatusInStore(id, !isActive);
      toast.error('Failed to update status');
    },
  });

  // ── Bulk Discount Mutation ──
  const bulkDiscountMutation = useMutation({
    mutationFn: (payload: BulkDiscountPayload) => applyBulkDiscountApi(payload),
    onSuccess: () => {
      toast.success(isAr ? 'تم تطبيق الخصم الجماعي بنجاح' : 'Bulk discount applied successfully');
      useProductStore.getState().clearSelectedProducts();
      useProductStore.getState().closeBulkDiscountModal();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || (isAr ? 'فشل تطبيق الخصم الجماعي' : 'Failed to apply bulk discount');
      toast.error(msg);
    },
  });

  // ── Export Products Mutation ──
  const exportMutation = useMutation({
    mutationFn: async (params?: ExportAdminProductsParams) => {
      try {
        return await exportAdminProducts(params);
      } catch (err) {
        console.warn('Backend export /admin/products/export failed, trying fallback client export:', err);
        const storeProducts = useProductStore.getState().products;
        if (storeProducts.length > 0) {
          const exportHeaders = [
            { key: 'id', label: 'Product ID' },
            { key: 'name', label: 'Product Name (EN)' },
            { key: 'nameAr', label: 'Product Name (AR)' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price (SAR)' },
            { key: 'totalStock', label: 'Stock' },
            { key: 'isActive', label: 'Is Active' },
          ];
          exportToXLSX('products_export', exportHeaders, storeProducts);
          return;
        }
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(isAr ? 'تم تصدير المنتجات بنجاح' : 'Products exported successfully');
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (isAr ? 'فشل تصدير المنتجات' : 'Failed to export products');
      toast.error(msg);
    },
  });

  return {
    productsQuery,
    categoriesQuery,
    statusMutation,
    bulkDiscountMutation,
    exportMutation,
  };
};
