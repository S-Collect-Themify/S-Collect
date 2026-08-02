import { useQuery } from '@tanstack/react-query';
import { getAdminCategories } from '../../../services/categories';
import { getVendors } from '../../../services/vendors';
import { getAllProducts } from '../../../services/products';

export const useBannerFormData = () => {
  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-ddl'],
    queryFn: () => getAdminCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const vendorsQuery = useQuery({
    queryKey: ['admin-vendors-ddl'],
    queryFn: () => getVendors({ status: 'ACTIVE' }),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['admin-products-ddl'],
    queryFn: async () => {
      const prods = await getAllProducts();
      if (Array.isArray(prods)) return prods;
      if (prods?.data && Array.isArray(prods.data)) return prods.data;
      if (prods?.items && Array.isArray(prods.items)) return prods.items;
      if (prods?.data?.items && Array.isArray(prods.data.items)) return prods.data.items;
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories: categoriesQuery.data || [],
    vendors: vendorsQuery.data || [],
    products: productsQuery.data || [],
    isLoading: categoriesQuery.isLoading || vendorsQuery.isLoading || productsQuery.isLoading,
    isError: categoriesQuery.isError || vendorsQuery.isError || productsQuery.isError,
  };
};
