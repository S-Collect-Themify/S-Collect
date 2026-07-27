import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../../services/products';

export const useProducts = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return { data, isLoading, error, refetch };
};
