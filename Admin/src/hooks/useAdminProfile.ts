import { useMemo } from 'react';
import { useAdminsData } from '../features/adminSettings/hooks/useAdminsData';
import { getToken, getDecodedToken } from '../services/auth';

export const useAdminProfile = () => {
  const token = getToken();
  const decoded = useMemo(() => getDecodedToken(token), [token]);
  const { admins, isLoading, isError, error } = useAdminsData();

  const currentAdmin = useMemo(() => {
    if (!admins || admins.length === 0) return null;
    const email = decoded?.email?.toLowerCase();
    const id = decoded?.id || decoded?.sub;

    if (email) {
      const match = admins.find((a) => a.email?.toLowerCase() === email);
      if (match) return match;
    }
    if (id) {
      const match = admins.find((a) => String(a.id) === String(id));
      if (match) return match;
    }
    return admins[0];
  }, [admins, decoded]);

  const fullName = useMemo(() => {
    if (currentAdmin) {
      if (currentAdmin.name) return currentAdmin.name;
      const combined = [currentAdmin.firstName, currentAdmin.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (combined) return combined;
      if (currentAdmin.email) return currentAdmin.email.split('@')[0];
    }
    if (decoded) {
      const tokenFullName = [
        decoded.firstName,
        decoded.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (tokenFullName) return tokenFullName;
      if (typeof decoded.name === 'string' && decoded.name) return decoded.name;
      if (typeof decoded.email === 'string' && decoded.email) return decoded.email.split('@')[0];
    }
    return '';
  }, [currentAdmin, decoded]);

  return {
    admin: currentAdmin,
    fullName: fullName,
    isLoading,
    isError,
    error,
  };
};
