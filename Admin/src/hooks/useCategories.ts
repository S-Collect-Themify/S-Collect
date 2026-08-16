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
          let list: any[] = [];
          if (Array.isArray(data)) {
            list = [...data];
          } else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
            list = [...(data as any).data];
          } else if (data && typeof data === 'object' && Array.isArray((data as any).categories)) {
            list = [...(data as any).categories];
          }
          list.sort((a, b) => {
            const dateA = a.createdAt || a.created_at;
            const dateB = b.createdAt || b.created_at;
            if (dateA && dateB) {
              const timeA = new Date(dateA).getTime();
              const timeB = new Date(dateB).getTime();
              if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
                return timeB - timeA;
              }
            }
            if (dateA && !dateB) return -1;
            if (!dateA && dateB) return 1;
            const idA = Number(a.id || a._id);
            const idB = Number(b.id || b._id);
            if (!isNaN(idA) && !isNaN(idB)) {
              return idB - idA;
            }
            return String(b.id || b._id || '').localeCompare(String(a.id || a._id || ''));
          });
          setCategories(list);
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
