import { getProductById } from '../../../services/products';
import { useQuery } from '@tanstack/react-query';

export const useProductDetails = (productId?: string) =>
  useQuery({
    queryKey: ['product-details', productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
    staleTime: 0,
    retry: 1,
  });
