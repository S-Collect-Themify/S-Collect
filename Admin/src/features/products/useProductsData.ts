import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllProducts, getCategories, getVendorsList, updateProductStatus } from '../../services/products';
import { useProductStore } from './productStore';
import type { ProductItem } from './types';

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
        const response = await getAllProducts();
        if (Array.isArray(response)) {
          const mapped: ProductItem[] = response.map((p: any) => ({
            id: p.id || p._id,
            name: p.title || p.name || 'Product',
            nameAr: p.titleAr || p.nameAr,
            vendor: p.vendor?.businessName || p.vendor?.name || p.vendor || 'Vendor',
            category: p.category?.name || p.category?.nameEn || p.category || 'General',
            price: Number(p.price) || 0,
            stock: Number(p.stock || p.inventory || 0),
            isActive: p.isActive !== undefined ? Boolean(p.isActive) : p.status === 'active',
            image: p.images?.[0]?.url || p.image || p.thumbnail || 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150',
          }));
          setProducts(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('API products query fallback to initial store state');
      }
      return null;
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

  // ── Fetch Vendors Query ──
  const vendorsQuery = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: getVendorsList,
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
      // Revert store state on error
      toggleProductStatusInStore(id, !isActive);
      toast.error('Failed to update status');
    },
  });

  return {
    productsQuery,
    categoriesQuery,
    vendorsQuery,
    statusMutation,
  };
};
