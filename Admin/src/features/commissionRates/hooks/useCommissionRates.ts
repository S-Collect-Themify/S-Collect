import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import {
  getPlatformCommission,
  updatePlatformCommission,
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

// ─── Local Custom Rate Storage Helpers ───────────────────────────────────────

const VENDOR_CUSTOM_RATES_KEY = 'admin_vendor_custom_commissions';
const CATEGORY_CUSTOM_RATES_KEY = 'admin_category_custom_commissions';

function getCustomRatesMap(storageKey: string): Record<string, { rate: number; date: string }> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCustomRate(storageKey: string, id: string, rate: number) {
  try {
    const map = getCustomRatesMap(storageKey);
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    map[id] = { rate, date: todayStr };
    localStorage.setItem(storageKey, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save custom rate to localStorage:', e);
  }
}

function removeCustomRate(storageKey: string, id: string) {
  try {
    const map = getCustomRatesMap(storageKey);
    delete map[id];
    localStorage.setItem(storageKey, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to remove custom rate from localStorage:', e);
  }
}

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
  const customMap = getCustomRatesMap(VENDOR_CUSTOM_RATES_KEY);

  return backendVendors.map((v) => {
    const mapped = mapBackendVendorToVendor(v);

    let customRate: number | null = null;
    let lastUpdated = mapped.createdAt
      ? new Date(mapped.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })
      : '----';

    if (customMap[v.id]) {
      customRate = customMap[v.id].rate;
      lastUpdated = customMap[v.id].date;
    } else if (typeof mapped.commissionRate === 'number' && !isNaN(mapped.commissionRate)) {
      customRate = normalizeRateFromApi(mapped.commissionRate);
    }

    const hasCustomRate = customRate !== null;
    return {
      id: v.id,
      vendorName: mapped.businessName,
      rate: customRate,
      status: (hasCustomRate ? 'Custom' : 'Default') as 'Custom' | 'Default',
      lastUpdated,
    };
  });
}

async function fetchCategoryCommissions(): Promise<CategoryCommissionItem[]> {
  const categories = await getAdminCategories({ pageSize: 100 });
  const customMap = getCustomRatesMap(CATEGORY_CUSTOM_RATES_KEY);

  return Promise.all(
    categories.map(async (cat) => {
      let customRate: number | null = null;
      let lastUpdated = '----';

      // 1. Fetch live custom commission from API GET /admin/categories/{id}/commission
      const apiCommission = await getCategoryCommission(cat.id);
      if (apiCommission !== null && typeof apiCommission.rate === 'number') {
        customRate = apiCommission.rate;
        if (apiCommission.updatedAt) {
          lastUpdated = new Date(apiCommission.updatedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });
        }
      } else if (customMap[cat.id]) {
        // 2. Fallback to locally saved custom rate
        customRate = customMap[cat.id].rate;
        lastUpdated = customMap[cat.id].date;
      }

      const hasCustomRate = customRate !== null;
      const categoryName = cat.nameEn || cat.name || cat.nameAr || '----';

      return {
        id: cat.id,
        categoryName,
        rate: customRate,
        status: (hasCustomRate ? 'Custom' : 'Default') as 'Custom' | 'Default',
        lastUpdated,
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
      setCustomRate(VENDOR_CUSTOM_RATES_KEY, id, rate);
      const todayStr = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      queryClient.setQueryData<VendorCommissionItem[]>(commissionKeys.vendors, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate, status: 'Custom', lastUpdated: todayStr } : item
        );
      });
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
      removeCustomRate(VENDOR_CUSTOM_RATES_KEY, id);
      queryClient.setQueryData<VendorCommissionItem[]>(commissionKeys.vendors, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate: null, status: 'Default', lastUpdated: '----' } : item
        );
      });
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
      setCustomRate(CATEGORY_CUSTOM_RATES_KEY, id, rate);
      const todayStr = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      queryClient.setQueryData<CategoryCommissionItem[]>(commissionKeys.categories, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate, status: 'Custom', lastUpdated: todayStr } : item
        );
      });
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
      removeCustomRate(CATEGORY_CUSTOM_RATES_KEY, id);
      queryClient.setQueryData<CategoryCommissionItem[]>(commissionKeys.categories, (old) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id ? { ...item, rate: null, status: 'Default', lastUpdated: '----' } : item
        );
      });
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

  // ── Reset confirm state ─────────────────────────────────────────────────────
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    name: string;
    type: 'vendor' | 'category';
  } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // ── Reset handlers ──────────────────────────────────────────────────────────

  const handleResetVendorCommission = (item: VendorCommissionItem) => {
    setResetTarget({ id: item.id, name: item.vendorName, type: 'vendor' });
    setIsResetConfirmOpen(true);
  };

  const handleResetCategoryCommission = (item: CategoryCommissionItem) => {
    setResetTarget({ id: item.id, name: item.categoryName, type: 'category' });
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    if (!resetTarget) return;
    if (resetTarget.type === 'vendor') {
      resetVendorMutation.mutate(resetTarget.id);
    } else {
      resetCategoryMutation.mutate(resetTarget.id);
    }
    setIsResetConfirmOpen(false);
    setIsModalOpen(false);
    setResetTarget(null);
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
      ...vendorCommissions.map((v) => ({ name: v.vendorName, rate: v.rate !== null ? `${v.rate}%` : '--', status: v.status, lastUpdated: v.lastUpdated })),
      ...categoryCommissions.map((c) => ({ name: c.categoryName, rate: c.rate !== null ? `${c.rate}%` : '--', status: c.status, lastUpdated: c.lastUpdated })),
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
      ...vendorCommissions.map((v) => ({ name: v.vendorName, rate: v.rate !== null ? `${v.rate}%` : '--', status: v.status, lastUpdated: v.lastUpdated })),
      ...categoryCommissions.map((c) => ({ name: c.categoryName, rate: c.rate !== null ? `${c.rate}%` : '--', status: c.status, lastUpdated: c.lastUpdated })),
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
    resetTarget,
    isModalOpen,
    isConfirmOpen,
    isResetConfirmOpen,
    setIsModalOpen,
    setIsConfirmOpen,
    setIsResetConfirmOpen,
    handleOpenEditPlatform,
    handleOpenEditVendor,
    handleOpenEditCategory,
    handleRequestConfirm,
    handleConfirmRateChange,
    handleResetVendorCommission,
    handleResetCategoryCommission,
    handleConfirmReset,
    handleExportExcel,
    handleExportPDF,
  };
}

