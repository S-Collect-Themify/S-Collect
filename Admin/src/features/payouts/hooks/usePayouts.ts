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
import type { PayoutStatCardData, PendingPayoutItem } from '../types';

interface PendingRegistration {
  id: string;
  amount: number;
  notes: string;
  date: string;
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
    return pendingData.items.map((item: any) => {
      const vId = item.vendorId || item.id || item._id || '';
      const vName = item.storeName || item.vendorName || [item.firstName, item.lastName].filter(Boolean).join(' ') || '--';

      const parseNum = (val: any) => {
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
    onError: (error: any) => {
      console.error('Failed to register payout:', error);
      const rawMsg = error?.response?.data?.message || error?.response?.data?.error;
      const formattedMsg = Array.isArray(rawMsg) ? rawMsg.join(' | ') : rawMsg;
      toast.error(formattedMsg || error?.message || t('payouts.registerError', 'Failed to register payout.'));
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

  const handleExportExcel = () => {
    const headers = [
      { key: 'vendorName' as const, label: 'Vendor Name' },
      { key: 'totalGmv' as const, label: 'Total GMV (SAR)' },
      { key: 'commission' as const, label: 'Commission (SAR)' },
      { key: 'totalPayouts' as const, label: 'Total Payouts (SAR)' },
      { key: 'pendingPayout' as const, label: 'Pending Payout (SAR)' },
    ];

    const exportData = pendingPayouts.map((item) => ({
      vendorName: item.vendorName,
      totalGmv: item.totalGmv.toLocaleString(),
      commission: item.commission.toLocaleString(),
      totalPayouts: item.totalPayouts.toLocaleString(),
      pendingPayout: item.pendingPayout.toLocaleString(),
    }));

    exportToCSV('Pending_Vendor_Payouts_Report', headers, exportData);
    toast.success(t('payouts.exportSuccess', 'Payouts report exported successfully!'));
  };

  const handleExportPDF = () => {
    const headers = [
      { key: 'vendorName' as const, label: 'Vendor Name' },
      { key: 'totalGmv' as const, label: 'Total GMV (SAR)' },
      { key: 'commission' as const, label: 'Commission (SAR)' },
      { key: 'totalPayouts' as const, label: 'Total Payouts (SAR)' },
      { key: 'pendingPayout' as const, label: 'Pending Payout (SAR)' },
    ];

    const exportData = pendingPayouts.map((item) => ({
      vendorName: item.vendorName,
      totalGmv: item.totalGmv.toLocaleString(),
      commission: item.commission.toLocaleString(),
      totalPayouts: item.totalPayouts.toLocaleString(),
      pendingPayout: item.pendingPayout.toLocaleString(),
    }));

    exportToPDF(
      t('payouts.title', 'Payouts Report'),
      headers,
      exportData
    );
  };

  return {
    isRtl,
    isLoading,
    isRegistering: createPayoutMutation.isPending,
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
