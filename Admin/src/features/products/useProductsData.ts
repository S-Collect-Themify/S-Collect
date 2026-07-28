import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminProducts, getAdminVendors, getCategories, updateProductStatus } from '../../services/products';
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

const getVendorDisplayName = (vId: string | undefined, vendorsList: any[], vendorProp: any): string => {
  if (vendorProp) {
    if (typeof vendorProp === 'string') return vendorProp;
    if (vendorProp.businessName) return vendorProp.businessName;
    if (vendorProp.storeName) return vendorProp.storeName;
    if (vendorProp.name) return vendorProp.name;
  }
  if (vId && vendorsList.length > 0) {
    const matched = vendorsList.find(
      (v: any) => String(v.id || v._id).toLowerCase() === String(vId).toLowerCase()
    );
    if (matched) {
      if (matched.businessName) return matched.businessName;
      if (matched.storeName) return matched.storeName;
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

export const useProductsData = () => {
  const queryClient = useQueryClient();
  const setProducts = useProductStore((s) => s.setProducts);
  const toggleProductStatusInStore = useProductStore((s) => s.toggleProductStatus);
  const closeDisableModal = useProductStore((s) => s.closeDisableModal);

  // ── Fetch Products Query ──
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const [productsRes, vendorsRes] = await Promise.allSettled([
          getAdminProducts(),
          getAdminVendors(),
        ]);

        const prodData = productsRes.status === 'fulfilled' ? productsRes.value : null;
        const vendData = vendorsRes.status === 'fulfilled' ? vendorsRes.value : null;

        const itemsArray = extractProductsArray(prodData);
        const vendorsList = extractVendorsArray(vendData);

        const mapped: ProductItem[] = itemsArray.map((p: any) => {
          const vId = p.vendorId || p.vendor?.id;
          const vName = getVendorDisplayName(vId, vendorsList, p.vendor);

          const catObj = typeof p.category === 'object' ? p.category : null;
          const categoryName = catObj?.name || (typeof p.category === 'string' ? p.category : 'General');
          const categoryNameAr = catObj?.nameAr || p.categoryAr || '';

          return {
            id: p.id || p._id,
            name: p.name || p.title || 'Product',
            nameAr: p.nameAr || p.titleAr,
            vendor: vName,
            vendorId: vId,
            category: categoryName,
            categoryAr: categoryNameAr,
            price: Number(p.minPrice ?? p.price ?? 0),
            stock: p.stock !== undefined && p.stock !== null ? p.stock : '',
            isActive: p.isActive !== undefined ? Boolean(p.isActive) : !p.isDisabled,
            image: p.thumbnailUrl || p.images?.[0]?.url || p.image || p.thumbnail || '',
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
    mutationFn: async ({ id, isActive }: { id: string | number; isActive: boolean }) => {
      return await updateProductStatus(id, isActive);
    },
    onMutate: async ({ id, isActive }) => {
      toggleProductStatusInStore(id, isActive);
      closeDisableModal();
    },
    onSuccess: () => {
      toast.success('Product status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (_err, { id, isActive }) => {
      toggleProductStatusInStore(id, !isActive);
      toast.error('Failed to update status');
    },
  });

  return {
    productsQuery,
    categoriesQuery,
    statusMutation,
  };
};
