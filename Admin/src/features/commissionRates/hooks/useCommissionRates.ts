import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import {
  getPlatformCommission,
  updatePlatformCommission,
  getVendorCommission,
  setVendorCommission,
  deleteVendorCommission,
  getCategoryCommission,
  setCategoryCommission,
  deleteCategoryCommission,
  normalizeRateFromApi,
} from '../../../services/commission';
import { getVendors } from '../../../services/vendors';
import { getAdminCategories } from '../../../services/categories';
import { mapBackendVendorToVendor } from '../../vendors/utils/vendorMapper';
import type {
  PlatformCommissionData,
  VendorCommissionItem,
  CategoryCommissionItem,
  EditModalTarget,
} from '../types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const commissionKeys = {
  platform: ['commission', 'platform'] as const,
  vendors: ['commission', 'vendors'] as const,
  categories: ['commission', 'categories'] as const,
};

// ─── Data Fetchers ────────────────────────────────────────────────────────────

async function fetchPlatformCommission(): Promise<PlatformCommissionData> {
  const data = await getPlatformCommission();
  return {
    rate: data.rate,
    lastUpdated: data.updatedAt
      ? new Date(data.updatedAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })
      : '----',
  };
}

async function fetchVendorCommissions(): Promise<VendorCommissionItem[]> {
  const backendVendors = await getVendors();
  return Promise.all(
    backendVendors.map(async (v) => {
      const mapped = mapBackendVendorToVendor(v);

      // Check per-vendor commission endpoint GET /admin/vendors/{id}/commission
      let customRate: number | null = null;
      if (typeof mapped.commissionRate === 'number' && !isNaN(mapped.commissionRate)) {
        customRate = normalizeRateFromApi(mapped.commissionRate);
      } else {
        const fetchedComm = await getVendorCommission(v.id);
        if (fetchedComm !== null) {
          customRate = fetchedComm;
        }
      }

      const hasCustomRate = customRate !== null;
      return {
        id: v.id,
        vendorName: mapped.businessName,
        rate: customRate,
        status: (hasCustomRate ? 'Custom' : 'Default') as 'Custom' | 'Default',
        lastUpdated: mapped.createdAt
          ? new Date(mapped.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : '----',
      };
    })
  );
}

async function fetchCategoryCommissions(): Promise<CategoryCommissionItem[]> {
  const categories = await getAdminCategories();
  return Promise.all(
    categories.map(async (cat) => {
      const commission = await getCategoryCommission(cat.id);
      const hasCustomRate = commission !== null;
      return {
        id: cat.id,
        categoryName: cat.nameEn || cat.name || '----',
        rate: hasCustomRate ? commission.rate : null,
        status: (hasCustomRate ? 'Custom' : 'Default') as 'Custom' | 'Default',
        lastUpdated:
          hasCustomRate && commission.updatedAt
            ? new Date(commission.updatedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })
            : '----',
      };
    })
  );
}

// ── Standalone Mutation Hooks ───────────────────────────────────────────────

export function useUpdatePlatformCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (rate: number) => updatePlatformCommission(rate),
    onSuccess: (updated) => {
      const formattedData: PlatformCommissionData = {
        rate: updated.rate,
        lastUpdated: updated.updatedAt
          ? new Date(updated.updatedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      queryClient.setQueryData<PlatformCommissionData>(commissionKeys.platform, formattedData);
      queryClient.invalidateQueries({ queryKey: commissionKeys.platform });
      toast.success(t('commissionRates.updateSuccess', 'Commission rate updated successfully!'));
    },
    onError: (error: any) => {
      console.error('Failed to update platform commission:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('commissionRates.saveError', 'Failed to save commission rate.'));
    },
  });
}

export function useSetVendorCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) => setVendorCommission(id, rate),
    onSuccess: (_, { id, rate }) => {
      queryClient.setQueryData<VendorCommissionItem[]>(commissionKeys.vendors, (old) => {
        if (!old) return [];
        const todayStr = new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        return old.map((item) =>
          item.id === id ? { ...item, rate, status: 'Custom', lastUpdated: todayStr } : item
        );
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.vendors });
      toast.success(t('commissionRates.updateSuccess', 'Commission rate updated successfully!'));
    },
    onError: (error: any) => {
      console.error('Failed to update vendor commission:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('commissionRates.saveError', 'Failed to save commission rate.'));
    },
  });
}

export function useResetVendorCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteVendorCommission(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<VendorCommissionItem[]>(commissionKeys.vendors, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate: null, status: 'Default', lastUpdated: '----' } : item
        );
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.vendors });
      toast.success(t('commissionRates.resetSuccess', 'Reset to platform default rate successfully.'));
    },
    onError: (error: any) => {
      console.error('Failed to reset vendor commission:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('commissionRates.resetError', 'Failed to reset commission rate.'));
    },
  });
}

export function useSetCategoryCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) => setCategoryCommission(id, rate),
    onSuccess: (_, { id, rate }) => {
      queryClient.setQueryData<CategoryCommissionItem[]>(commissionKeys.categories, (old) => {
        if (!old) return [];
        const todayStr = new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        return old.map((item) =>
          item.id === id ? { ...item, rate, status: 'Custom', lastUpdated: todayStr } : item
        );
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.categories });
      toast.success(t('commissionRates.updateSuccess', 'Commission rate updated successfully!'));
    },
    onError: (error: any) => {
      console.error('Failed to update category commission:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('commissionRates.saveError', 'Failed to save commission rate.'));
    },
  });
}

export function useResetCategoryCommission() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryCommission(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<CategoryCommissionItem[]>(commissionKeys.categories, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate: null, status: 'Default', lastUpdated: '----' } : item
        );
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.categories });
      toast.success(t('commissionRates.resetSuccess', 'Reset to platform default rate successfully.'));
    },
    onError: (error: any) => {
      console.error('Failed to reset category commission:', error);
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('commissionRates.resetError', 'Failed to reset commission rate.'));
    },
  });
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useCommissionRates() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // ── Modal / confirm state ───────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    id: string;
    type: 'platform' | 'vendor' | 'category';
    newRate: number;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const {
    data: platformCommission = { rate: 0, lastUpdated: '----' },
    isLoading: isPlatformLoading,
  } = useQuery({
    queryKey: commissionKeys.platform,
    queryFn: fetchPlatformCommission,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: vendorCommissions = [],
    isLoading: isVendorsLoading,
  } = useQuery({
    queryKey: commissionKeys.vendors,
    queryFn: fetchVendorCommissions,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: categoryCommissions = [],
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: commissionKeys.categories,
    queryFn: fetchCategoryCommissions,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const isLoading = isPlatformLoading || isVendorsLoading || isCategoriesLoading;

  // ── Mutation Instances ──────────────────────────────────────────────────────
  const updatePlatformMutation = useUpdatePlatformCommission();
  const setVendorMutation = useSetVendorCommission();
  const resetVendorMutation = useResetVendorCommission();
  const setCategoryMutation = useSetCategoryCommission();
  const resetCategoryMutation = useResetCategoryCommission();

  const isSaving =
    updatePlatformMutation.isPending ||
    setVendorMutation.isPending ||
    resetVendorMutation.isPending ||
    setCategoryMutation.isPending ||
    resetCategoryMutation.isPending;

  // ── Modal openers ───────────────────────────────────────────────────────────

  const handleOpenEditPlatform = () => {
    setEditTarget({
      type: 'platform',
      id: 'platform',
      name: t('commissionRates.platformDefaultTitle', 'Platform Default Commission'),
      currentRate: platformCommission.rate,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditVendor = (item: VendorCommissionItem) => {
    setEditTarget({
      type: 'vendor',
      id: item.id,
      name: item.vendorName,
      currentRate: item.rate ?? platformCommission.rate,
      currentStatus: item.status,
      hasCustomRate: item.status === 'Custom',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditCategory = (item: CategoryCommissionItem) => {
    setEditTarget({
      type: 'category',
      id: item.id,
      name: item.categoryName,
      currentRate: item.rate ?? platformCommission.rate,
      currentStatus: item.status,
      hasCustomRate: item.status === 'Custom',
    });
    setIsModalOpen(true);
  };

  // ── Request confirm ─────────────────────────────────────────────────────────

  const handleRequestConfirm = (
    id: string,
    type: 'platform' | 'vendor' | 'category',
    newRate: number
  ) => {
    setPendingChange({ id, type, newRate });
    setIsConfirmOpen(true);
  };

  // ── Confirm & save ──────────────────────────────────────────────────────────

  const handleConfirmRateChange = () => {
    if (!pendingChange) return;
    const { id, type, newRate } = pendingChange;

    if (type === 'platform') {
      updatePlatformMutation.mutate(newRate);
    } else if (type === 'vendor') {
      setVendorMutation.mutate({ id, rate: newRate });
    } else if (type === 'category') {
      setCategoryMutation.mutate({ id, rate: newRate });
    }

    setIsConfirmOpen(false);
    setIsModalOpen(false);
    setPendingChange(null);
  };

  // ── Reset handlers ──────────────────────────────────────────────────────────

  const handleResetVendorCommission = (item: VendorCommissionItem) => {
    resetVendorMutation.mutate(item.id);
  };

  const handleResetCategoryCommission = (item: CategoryCommissionItem) => {
    resetCategoryMutation.mutate(item.id);
  };

  // ── Export ──────────────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    const headers = [
      { key: 'name' as const, label: 'Name / Type' },
      { key: 'rate' as const, label: 'Commission Rate (%)' },
      { key: 'status' as const, label: 'Status' },
      { key: 'lastUpdated' as const, label: 'Last Updated' },
    ];
    const exportData = [
      { name: 'Platform Default', rate: `${platformCommission.rate}%`, status: 'Global', lastUpdated: platformCommission.lastUpdated },
      ...vendorCommissions.map((v) => ({ name: v.vendorName, rate: v.rate !== null ? `${v.rate}%` : '----', status: v.status, lastUpdated: v.lastUpdated })),
      ...categoryCommissions.map((c) => ({ name: c.categoryName, rate: c.rate !== null ? `${c.rate}%` : '----', status: c.status, lastUpdated: c.lastUpdated })),
    ];
    exportToCSV('Commission_Rates_Report', headers, exportData);
    toast.success(t('commissionRates.exportSuccess', 'Commission Rates exported successfully!'));
  };

  const handleExportPDF = () => {
    const headers = [
      { key: 'name' as const, label: 'Name / Type' },
      { key: 'rate' as const, label: 'Commission Rate (%)' },
      { key: 'status' as const, label: 'Status' },
      { key: 'lastUpdated' as const, label: 'Last Updated' },
    ];
    const exportData = [
      { name: 'Platform Default', rate: `${platformCommission.rate}%`, status: 'Global', lastUpdated: platformCommission.lastUpdated },
      ...vendorCommissions.map((v) => ({ name: v.vendorName, rate: v.rate !== null ? `${v.rate}%` : '----', status: v.status, lastUpdated: v.lastUpdated })),
      ...categoryCommissions.map((c) => ({ name: c.categoryName, rate: c.rate !== null ? `${c.rate}%` : '----', status: c.status, lastUpdated: c.lastUpdated })),
    ];
    exportToPDF(t('commissionRates.title', 'Commission Rates'), headers, exportData);
  };

  return {
    isRtl,
    isLoading,
    isSaving,
    platformCommission,
    vendorCommissions,
    categoryCommissions,
    editTarget,
    isModalOpen,
    isConfirmOpen,
    setIsModalOpen,
    setIsConfirmOpen,
    handleOpenEditPlatform,
    handleOpenEditVendor,
    handleOpenEditCategory,
    handleRequestConfirm,
    handleConfirmRateChange,
    handleResetVendorCommission,
    handleResetCategoryCommission,
    handleExportExcel,
    handleExportPDF,
  };
}

