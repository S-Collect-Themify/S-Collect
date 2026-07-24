import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../../services/products';
import { mapProductToFormData } from './utils';
import type { ProductFormData } from './types';

export const useProduct = (productId?: string) => {
  return useQuery<ProductFormData>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const raw = await getProductById(productId!);

      // Unwrap if the response is in a { success: boolean, data: T } envelope
      const unwrapped =
        raw && typeof raw === 'object' && 'success' in raw && 'data' in raw
          ? raw.data
          : raw;

      return await mapProductToFormData(unwrapped);
    },
    enabled: Boolean(productId),
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
