import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import { INITIAL_PAYOUT_STATS, INITIAL_PENDING_PAYOUTS } from '../data';
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
  const [stats] = useState<PayoutStatCardData[]>(INITIAL_PAYOUT_STATS);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayoutItem[]>(
    INITIAL_PENDING_PAYOUTS
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedVendor, setSelectedVendor] = useState<PendingPayoutItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation modal state
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Simulate skeleton loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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
