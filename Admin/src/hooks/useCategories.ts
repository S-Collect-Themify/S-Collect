import { useState, useEffect } from 'react';
import { getAdminCategories } from '../services/categories';
import { getCategories } from '../services/products';

export const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        let data: any;
        try {
          data = await getAdminCategories();
        } catch {
          data = await getCategories();
        }

        if (active) {
          if (Array.isArray(data)) {
            setCategories(data);
          } else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
            setCategories((data as any).data);
          } else if (data && typeof data === 'object' && Array.isArray((data as any).categories)) {
            setCategories((data as any).categories);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        if (active) {
          setError(err as Error);
          setCategories([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  return { categories, isLoading, error };
};
