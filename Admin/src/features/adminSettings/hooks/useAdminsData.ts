import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import {
  getAdminAccounts,
  createAdminAccount,
  deleteAdminAccount,
  toggleAdminStatusApi,
  type CreateAdminPayload,
  type ApiAdminItem,
} from '../../../services/admins';
import type { AdminAccount } from '../types';
import { useAdminSettingsStore } from '../store';

export const ADMINS_QUERY_KEY = ['admin-accounts'];

export const normalizeSaudiPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `+966${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return `+966${cleaned}`;
  }
  if (cleaned.startsWith('9665') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('+9665') && cleaned.length === 13) {
    return cleaned;
  }
  return phone;
};

export const isValidSaudiPhone = (phone: string): boolean => {
  const normalized = normalizeSaudiPhone(phone);
  return /^\+9665\d{8}$/.test(normalized);
};

const mapRole = (roleStr: string): string => {
  if (!roleStr) return 'Admin';
  const upper = roleStr.toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'Super Admin';
  if (upper === 'ADMIN') return 'Admin';
  return roleStr;
};

const mapStatus = (statusStr?: string | null): 'Active' | 'Inactive' => {
  if (!statusStr) return 'Inactive';
  const upper = statusStr.toUpperCase();
  if (upper === 'ACTIVE' || upper === 'ENABLED') return 'Active';
  return 'Inactive';
};

export const useAdminsData = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const setViewMode = useAdminSettingsStore((s) => s.setViewMode);
  const setEditingAdmin = useAdminSettingsStore((s) => s.setEditingAdmin);

  const adminsQuery = useQuery({
    queryKey: ADMINS_QUERY_KEY,
    queryFn: async (): Promise<AdminAccount[]> => {
      try {
        const raw = await getAdminAccounts();
        return raw.map((a: ApiAdminItem) => {
          const fullName =
            [a.firstName, a.lastName].filter(Boolean).join(' ').trim() ||
            a.email?.split('@')[0] ||
            'Admin';

          const rawDate = a.dateAdded || a.createdAt;
          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '';

          return {
            id: a.id,
            name: fullName,
            firstName: a.firstName || '',
            lastName: a.lastName || '',
            email: a.email || '',
            phoneNumber: a.phoneNumber || '',
            role: mapRole(a.role),
            status: mapStatus(a.status),
            dateAdded: formattedDate,
          };
        });
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.status === 403) {
          return [];
        }
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const createAdminMutation = useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdminAccount(payload),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم إضافة المسؤول بنجاح' : 'Admin added successfully'
      );
      queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      setViewMode('admins');
      setEditingAdmin(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to create admin'
      );
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAccount(id),
    onSuccess: () => {
      toast.success(
        i18n.language === 'ar' ? 'تم حذف المسؤول بنجاح' : 'Admin deleted successfully'
      );
      queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to delete admin'
      );
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus?: 'Active' | 'Inactive' | '' }) => {
      const nextStatus = currentStatus === 'Active' ? 'INACTIVE' : 'ACTIVE';
      await toggleAdminStatusApi(id, nextStatus);
      return { id, nextStatus };
    },
    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: ADMINS_QUERY_KEY });
      const previousAdmins = queryClient.getQueryData<AdminAccount[]>(ADMINS_QUERY_KEY);
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      queryClient.setQueryData<AdminAccount[]>(ADMINS_QUERY_KEY, (old) =>
        old ? old.map((a) => (a.id === id ? { ...a, status: newStatus } : a)) : []
      );
      return { previousAdmins };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousAdmins) {
        queryClient.setQueryData(ADMINS_QUERY_KEY, context.previousAdmins);
      }
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to toggle admin status'
      );
    },
    onSuccess: (data) => {
      const isActivating = data?.nextStatus === 'ACTIVE';
      toast.success(
        isActivating
          ? (i18n.language === 'ar' ? 'تم تفعيل المسؤول بنجاح' : 'Admin reactivated successfully')
          : (i18n.language === 'ar' ? 'تم إلغاء تفعيل المسؤول بنجاح' : 'Admin deactivated successfully')
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
    },
  });

  return {
    admins: adminsQuery.data || [],
    isLoading: adminsQuery.isLoading,
    isError: adminsQuery.isError,
    error: adminsQuery.error,
    refetch: adminsQuery.refetch,
    createAdminMutation,
    deleteAdminMutation,
    toggleStatusMutation,
  };
};
