import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import { getVendors } from '../../../services/vendors';
import { INITIAL_PAYOUT_STATS } from '../data';
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

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PayoutStatCardData[]>(INITIAL_PAYOUT_STATS);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayoutItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedVendor, setSelectedVendor] = useState<PendingPayoutItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation modal state
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const vendors = await getVendors();
        if (!isMounted) return;

        const mappedItems: PendingPayoutItem[] = (vendors || []).map((v) => {
          const vName =
            v.storeName ||
            [v.firstName, v.lastName].filter(Boolean).join(' ') ||
            '--';
          return {
            id: v.id,
            vendorName: vName,
            bankAccount: '--',
            totalGmv: 0,
            commission: 0,
            totalPayouts: 0,
            pendingPayout: 0,
            status: v.status || '--',
          };
        });

        setPendingPayouts(mappedItems);

        setStats([
          {
            id: 'stat1',
            titleKey: 'payouts.totalRegisteredTitle',
            defaultTitle: 'Total Payouts Registered',
            value: '--',
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
            value: '--',
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
            value: mappedItems.length > 0 ? String(mappedItems.length) : '--',
            unit: 'Vendors',
            badgeTextKey: 'payouts.badgeAllAccounts',
            defaultBadgeText: 'All Accounts',
            badgeVariant: 'blue',
            iconType: 'users',
          },
        ]);
      } catch (err) {
        console.error('Failed to load payouts data:', err);
        if (isMounted) {
          setPendingPayouts([]);
          setStats([
            {
              id: 'stat1',
              titleKey: 'payouts.totalRegisteredTitle',
              defaultTitle: 'Total Payouts Registered',
              value: '--',
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
              value: '--',
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
              value: '--',
              unit: 'Vendors',
              badgeTextKey: 'payouts.badgeAllAccounts',
              defaultBadgeText: 'All Accounts',
              badgeVariant: 'blue',
              iconType: 'users',
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.ceil(pendingPayouts.length / itemsPerPage);
  const paginatedItems = pendingPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

    const { id, amount } = pendingRegistration;

    setPendingPayouts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPending = Math.max(0, item.pendingPayout - amount);
          const newTotalPayouts = item.totalPayouts + amount;
          return {
            ...item,
            pendingPayout: newPending,
            totalPayouts: newTotalPayouts,
          };
        }
        return item;
      })
    );

    toast.success(
      t('payouts.registerSuccessToast', 'Payout registered successfully!')
    );

    setIsConfirmOpen(false);
    setIsModalOpen(false);
    setSelectedVendor(null);
    setPendingRegistration(null);
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
    stats,
    pendingPayouts,
    paginatedItems,
    currentPage,
    totalPages,
    totalItems: pendingPayouts.length,
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
