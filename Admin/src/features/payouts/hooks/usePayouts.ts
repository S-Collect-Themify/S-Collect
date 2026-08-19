import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import {
  getAdminPayoutsSummary,
  getAdminPendingVendorPayouts,
  createVendorPayout,
} from '../../../services/payouts';
import { getVendorBankInfo } from '../../../services/vendors';
import type { PayoutStatCardData, PendingPayoutItem } from '../types';

export function useVendorBankInfo(vendorId?: string) {
  return useQuery({
    queryKey: ['vendor-bank-info', vendorId],
    queryFn: () => getVendorBankInfo(vendorId!),
    enabled: Boolean(vendorId),
  });
}

interface PendingRegistration {
  id: string;
  amount: number;
  notes: string;
  date: string;
}

export async function fetchAllPendingVendorPayouts(): Promise<PendingPayoutItem[]> {
  const firstRes = await getAdminPendingVendorPayouts({ pageNum: 1, pageSize: 100 });
  let items = [...firstRes.items];
  const totalPages = firstRes.pagination?.totalPages ?? 1;

  if (totalPages > 1) {
    const remainingPromises = [];
    for (let page = 2; page <= totalPages; page++) {
      remainingPromises.push(getAdminPendingVendorPayouts({ pageNum: page, pageSize: 100 }));
    }
    const remainingResults = await Promise.all(remainingPromises);
    for (const res of remainingResults) {
      items = items.concat(res.items);
    }
  }

  const parseNum = (val: unknown) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return 0;
  };

  return items.map((rawItem: unknown) => {
    const item = rawItem as Record<string, any>;
    const vId = String(item.vendorId || item.id || item._id || '');
    const vName = (item.storeName || item.vendorName || [item.firstName, item.lastName].filter(Boolean).join(' ') || '--') as string;

    return {
      id: vId,
      vendorName: vName,
      bankAccount: '--',
      totalGmv: parseNum(item.totalGmv),
      commission: parseNum(item.commission),
      totalPayouts: parseNum(item.totalPayouts),
      pendingPayout: parseNum(item.pendingPayout),
      status: 'Pending',
    };
  });
}

export interface ExportPayoutsPayload {
  format: 'excel' | 'pdf';
  fileName: string;
  title: string;
  headers: Array<{ key: keyof PendingPayoutItem; label: string }>;
  summaryStats: Array<{ label: string; value: string }>;
}

export function useExportPayoutsMutation() {
  return useMutation({
    mutationFn: async (payload: ExportPayoutsPayload) => {
      const allItems = await fetchAllPendingVendorPayouts();

      if (!allItems.length) {
        throw new Error('No payout data available to export');
      }

      const exportData = allItems.map((item) => ({
        vendorName: item.vendorName,
        totalGmv: item.totalGmv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        commission: item.commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalPayouts: item.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        pendingPayout: item.pendingPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));

      if (payload.format === 'excel') {
        exportToCSV(payload.fileName, payload.headers, exportData, payload.summaryStats);
      } else {
        exportToPDF(payload.title, payload.headers, exportData, payload.summaryStats);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.format === 'excel') {
        toast.success('Payouts report exported to Excel successfully!');
      } else {
        toast.success('Payouts report exported to PDF successfully!');
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message || 'Failed to export payouts report');
    },
  });
}

export function usePayouts() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [selectedVendor, setSelectedVendor] = useState<PendingPayoutItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation modal state
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 1. Fetch Summary GET /api/v1/admin/payouts/summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['admin-payouts-summary'],
    queryFn: getAdminPayoutsSummary,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Pending Vendors List GET /api/v1/admin/payouts/pending-vendors
  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-pending-vendors', currentPage, itemsPerPage],
    queryFn: () => getAdminPendingVendorPayouts({ pageNum: currentPage, pageSize: itemsPerPage }),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isSummaryLoading || isPendingLoading;

  const pendingPayouts: PendingPayoutItem[] = useMemo(() => {
    if (!pendingData?.items) return [];
    return pendingData.items.map((rawItem: unknown) => {
      const item = rawItem as Record<string, any>;
      const vId = String(item.vendorId || item.id || item._id || '');
      const vName = (item.storeName || item.vendorName || [item.firstName, item.lastName].filter(Boolean).join(' ') || '--') as string;

      const parseNum = (val: unknown) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val) || 0;
        return 0;
      };

      return {
        id: vId,
        vendorName: vName,
        bankAccount: '--',
        totalGmv: parseNum(item.totalGmv),
        commission: parseNum(item.commission),
        totalPayouts: parseNum(item.totalPayouts),
        pendingPayout: parseNum(item.pendingPayout),
        status: 'Pending',
      };
    });
  }, [pendingData]);

  const totalItems = pendingData?.pagination?.totalItems ?? pendingPayouts.length;
  const totalPages = pendingData?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const stats: PayoutStatCardData[] = useMemo(() => {
    return [
      {
        id: 'stat1',
        titleKey: 'payouts.totalRegisteredTitle',
        defaultTitle: 'Total Payouts Registered',
        value: summaryData?.totalPayoutsRegistered != null
          ? summaryData.totalPayoutsRegistered.toLocaleString('en-US')
          : '--',
        unit: 'SAR',
        badgeTextKey: 'payouts.badgeActivePeriod',
        defaultBadgeText: 'Active Period',
        badgeVariant: 'emerald',
        iconType: 'check',
      },
      {
        id: 'stat2',
        titleKey: 'payouts.pendingPayoutsTitle',
        defaultTitle: 'Pending Payouts',
        value: summaryData?.pendingPayouts != null
          ? summaryData.pendingPayouts.toLocaleString('en-US')
          : '--',
        unit: 'SAR',
        badgeTextKey: 'payouts.badgeRequiresAction',
        defaultBadgeText: 'Requires Action',
        badgeVariant: 'amber',
        iconType: 'clock',
      },
      {
        id: 'stat3',
        titleKey: 'payouts.vendorsWithPendingTitle',
        defaultTitle: 'Vendors with Pending',
        value: summaryData?.vendorsWithPending != null
          ? summaryData.vendorsWithPending.toLocaleString('en-US')
          : '--',
        unit: 'Vendors',
        badgeTextKey: 'payouts.badgeAllAccounts',
        defaultBadgeText: 'All Accounts',
        badgeVariant: 'blue',
        iconType: 'users',
      },
    ];
  }, [summaryData]);

  const queryClient = useQueryClient();

  const createPayoutMutation = useMutation({
    mutationFn: ({
      vendorId,
      payload,
    }: {
      vendorId: string;
      payload: {
        amount: number;
        isAdjustment?: boolean;
        referenceNote?: string;
        transferDate?: string;
        clarifyingNote?: string;
      };
    }) => createVendorPayout(vendorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-payout-summary'] });
      toast.success(t('payouts.registerSuccessToast', 'Payout registered successfully!'));
    },
    onError: (error: Error | unknown) => {
      console.error('Failed to register payout:', error);
      const errObj = error as { response?: { data?: { message?: string | string[]; error?: string | string[] } }; message?: string };
      const rawMsg = errObj?.response?.data?.message || errObj?.response?.data?.error;
      const formattedMsg = Array.isArray(rawMsg) ? rawMsg.join(' | ') : rawMsg;
      toast.error(formattedMsg || errObj?.message || t('payouts.registerError', 'Failed to register payout.'));
    },
  });

  const handleOpenRegisterModal = (vendor: PendingPayoutItem) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleRequestConfirm = (
    id: string,
    amount: number,
    notes: string,
    date: string
  ) => {
    setPendingRegistration({ id, amount, notes, date });
    setIsConfirmOpen(true);
  };

  const handleExecuteRegister = () => {
    if (!pendingRegistration) return;

    const { id, amount, notes, date } = pendingRegistration;

    createPayoutMutation.mutate(
      {
        vendorId: id,
        payload: {
          amount,
          isAdjustment: false,
          referenceNote: notes?.trim() || undefined,
          transferDate: date || new Date().toISOString().split('T')[0],
          clarifyingNote: notes?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setIsModalOpen(false);
          setSelectedVendor(null);
          setPendingRegistration(null);
        },
      }
    );
  };

  const exportMutation = useExportPayoutsMutation();

  const handleExportExcel = () => {
    const currencySymbol = isAr ? '﷼' : 'SAR';
    const summaryStats = [
      {
        label: t('payouts.totalRegisteredTitle', 'Total Payouts Registered'),
        value: summaryData?.totalPayoutsRegistered != null
          ? `${summaryData.totalPayoutsRegistered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`
          : '--',
      },
      {
        label: t('payouts.pendingPayoutsTitle', 'Pending Payouts'),
        value: summaryData?.pendingPayouts != null
          ? `${summaryData.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`
          : '--',
      },
      {
        label: t('payouts.vendorsWithPendingTitle', 'Vendors with Pending'),
        value: summaryData?.vendorsWithPending != null
          ? `${summaryData.vendorsWithPending.toLocaleString('en-US')} ${t('payouts.vendorsUnit', 'Vendors')}`
          : '--',
      },
    ];

    const headers = [
      { key: 'vendorName' as const, label: t('payouts.vendorName', 'Vendor Name') },
      { key: 'totalGmv' as const, label: t('payouts.totalGmv', 'Total GMV (SAR)') },
      { key: 'commission' as const, label: t('payouts.commission', 'Commission (SAR)') },
      { key: 'totalPayouts' as const, label: t('payouts.totalPayouts', 'Total Payouts (SAR)') },
      { key: 'pendingPayout' as const, label: t('payouts.pendingPayout', 'Pending Payout (SAR)') },
    ];

    exportMutation.mutate({
      format: 'excel',
      fileName: 'Pending_Vendor_Payouts_Report',
      title: t('payouts.title', 'Payouts Report'),
      headers,
      summaryStats,
    });
  };

  const handleExportPDF = () => {
    const currencySymbol = isAr ? '﷼' : 'SAR';
    const summaryStats = [
      {
        label: t('payouts.totalRegisteredTitle', 'Total Payouts Registered'),
        value: summaryData?.totalPayoutsRegistered != null
          ? `${summaryData.totalPayoutsRegistered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`
          : '--',
      },
      {
        label: t('payouts.pendingPayoutsTitle', 'Pending Payouts'),
        value: summaryData?.pendingPayouts != null
          ? `${summaryData.pendingPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`
          : '--',
      },
      {
        label: t('payouts.vendorsWithPendingTitle', 'Vendors with Pending'),
        value: summaryData?.vendorsWithPending != null
          ? `${summaryData.vendorsWithPending.toLocaleString('en-US')} Vendors`
          : '--',
      },
    ];

    const headers = [
      { key: 'vendorName' as const, label: t('payouts.vendorName', 'Vendor Name') },
      { key: 'totalGmv' as const, label: t('payouts.totalGmv', 'Total GMV (SAR)') },
      { key: 'commission' as const, label: t('payouts.commission', 'Commission (SAR)') },
      { key: 'totalPayouts' as const, label: t('payouts.totalPayouts', 'Total Payouts (SAR)') },
      { key: 'pendingPayout' as const, label: t('payouts.pendingPayout', 'Pending Payout (SAR)') },
    ];

    exportMutation.mutate({
      format: 'pdf',
      fileName: 'Pending_Vendor_Payouts_Report',
      title: t('payouts.title', 'Payouts Report'),
      headers,
      summaryStats,
    });
  };

  return {
    isRtl,
    isLoading,
    isRegistering: createPayoutMutation.isPending,
    isExporting: exportMutation.isPending,
    stats,
    pendingPayouts,
    paginatedItems: pendingPayouts,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    selectedVendor,
    isModalOpen,
    isConfirmOpen,
    pendingRegistration,
    setCurrentPage,
    setIsModalOpen,
    setIsConfirmOpen,
    handleOpenRegisterModal,
    handleRequestConfirm,
    handleExecuteRegister,
    handleExportExcel,
    handleExportPDF,
  };
}
