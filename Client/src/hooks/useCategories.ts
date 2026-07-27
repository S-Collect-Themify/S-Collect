import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/products';

export const useCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await getCategories();
      if (Array.isArray(data)) {
        return data;
      } else if (
        data &&
        typeof data === 'object' &&
        Array.isArray((data as any).data)
      ) {
        return (data as any).data;
      } else if (
        data &&
        typeof data === 'object' &&
        Array.isArray((data as any).categories)
      ) {
        return (data as any).categories;
      } else {
        console.error('Invalid categories API response structure:', data);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    categories: data || [],
    isLoading,
    error: error as Error | null,
  };
};
