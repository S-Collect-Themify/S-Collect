import { useQuery } from '@tanstack/react-query';
import { getAdminProductById, type SingleAdminProductDetail } from '../../../services/products';

export const ADMIN_PRODUCT_DETAILS_QUERY_KEY = 'admin-product-details';

export const useProductDetails = (productId?: string) => {
  const productQuery = useQuery({
    queryKey: [ADMIN_PRODUCT_DETAILS_QUERY_KEY, productId],
    queryFn: async (): Promise<SingleAdminProductDetail | null> => {
      if (!productId) return null;
      return await getAdminProductById(productId);
    },
    enabled: Boolean(productId),
    staleTime: 2 * 60 * 1000,
  });

  return {
    product: productQuery.data || null,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
    refetch: productQuery.refetch,
  };
};
