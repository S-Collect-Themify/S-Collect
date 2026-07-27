import { getProductById } from '../../../services/products';
import { useQuery } from '@tanstack/react-query';

export const useProductDetails = (productId?: string) =>
  useQuery({
    queryKey: ['product-details', productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
