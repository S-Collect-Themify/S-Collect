import { useMemo } from 'react';
import { useAdminsData } from '../features/adminSettings/hooks/useAdminsData';
import { getToken, getDecodedToken } from '../services/auth';

export const useAdminProfile = () => {
  const token = getToken();
  const decoded = useMemo(() => getDecodedToken(token), [token]);

  // Read stored user from localStorage (persisted on login)
  const storedUser = useMemo(() => {
    const raw = localStorage.getItem('admin_user') || localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const roleStr = (storedUser?.role || decoded?.role || '').toUpperCase();
  const isSuperAdmin = roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN';

  const { admins, isLoading, isError, error } = useAdminsData({ enabled: isSuperAdmin });

  const currentAdmin = useMemo(() => {
    // 1. From admins list if available (Super Admin)
    if (admins && admins.length > 0) {
      const email = decoded?.email?.toLowerCase() || storedUser?.email?.toLowerCase();
      const id = decoded?.id || decoded?.sub || storedUser?.id;

      if (email) {
        const match = admins.find((a) => a.email?.toLowerCase() === email);
        if (match) return match;
      }
      if (id) {
        const match = admins.find((a) => String(a.id) === String(id));
        if (match) return match;
      }
      return admins[0];
    }

    // 2. From stored user in localStorage
    if (storedUser) {
      const sFirst = storedUser.firstName || storedUser.first_name || '';
      const sLast = storedUser.lastName || storedUser.last_name || '';
      const sName =
        storedUser.name ||
        storedUser.fullName ||
        [sFirst, sLast].filter(Boolean).join(' ').trim() ||
        storedUser.username ||
        storedUser.email?.split('@')[0] ||
        '';

      return {
        id: String(storedUser.id || storedUser._id || decoded?.id || decoded?.sub || '1'),
        name: sName,
        firstName: sFirst,
        lastName: sLast,
        email: storedUser.email || decoded?.email || '',
        phoneNumber: storedUser.phoneNumber || storedUser.phone || '',
        role: storedUser.role || decoded?.role || 'Admin',
        status: 'Active' as const,
        dateAdded: storedUser.dateAdded || storedUser.createdAt || '',
      };
    }

    // 3. From decoded JWT
    if (decoded) {
      const dFirst = (decoded.firstName || (decoded as any).first_name || '') as string;
      const dLast = (decoded.lastName || (decoded as any).last_name || '') as string;
      const dName =
        (typeof decoded.name === 'string' ? decoded.name : '') ||
        (typeof (decoded as any).fullName === 'string' ? (decoded as any).fullName : '') ||
        [dFirst, dLast].filter(Boolean).join(' ').trim() ||
        (typeof (decoded as any).username === 'string' ? (decoded as any).username : '') ||
        (typeof decoded.email === 'string' ? decoded.email.split('@')[0] : '');

      return {
        id: String(decoded.id || decoded.sub || '1'),
        name: dName,
        firstName: dFirst,
        lastName: dLast,
        email: decoded.email || '',
        phoneNumber: '',
        role: decoded.role || 'Admin',
        status: 'Active' as const,
        dateAdded: '',
      };
    }

    return null;
  }, [admins, decoded, storedUser]);

  const fullName = useMemo(() => {
    if (currentAdmin) {
      if (currentAdmin.name && currentAdmin.name !== '--') return currentAdmin.name;
      const combined = [currentAdmin.firstName, currentAdmin.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (combined) return combined;
      if (currentAdmin.email) return currentAdmin.email.split('@')[0];
    }
    if (storedUser) {
      if (storedUser.name) return storedUser.name;
      if (storedUser.fullName) return storedUser.fullName;
      const combined = [storedUser.firstName || storedUser.first_name, storedUser.lastName || storedUser.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (combined) return combined;
      if (storedUser.email) return storedUser.email.split('@')[0];
    }
    if (decoded) {
      const tokenFullName = [decoded.firstName, decoded.lastName].filter(Boolean).join(' ').trim();
      if (tokenFullName) return tokenFullName;
      if (typeof decoded.name === 'string' && decoded.name) return decoded.name;
      if (typeof decoded.email === 'string' && decoded.email) return decoded.email.split('@')[0];
    }
    return '';
  }, [currentAdmin, decoded, storedUser]);

  return {
    admin: currentAdmin,
    fullName: fullName,
    isSuperAdmin,
    isLoading,
    isError,
    error,
  };
};
