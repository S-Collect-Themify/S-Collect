import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import {
  INITIAL_PLATFORM_COMMISSION,
  INITIAL_VENDOR_COMMISSIONS,
  INITIAL_CATEGORY_COMMISSIONS,
} from '../data';
import type {
  PlatformCommissionData,
  VendorCommissionItem,
  CategoryCommissionItem,
  EditModalTarget,
  CommissionStatus,
} from '../types';

interface PendingChange {
  id: string;
  type: 'platform' | 'vendor' | 'category';
  newRate: number;
  newStatus?: CommissionStatus;
}

export function useCommissionRates() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [isLoading, setIsLoading] = useState(true);

  const [platformCommission, setPlatformCommission] = useState<PlatformCommissionData>(
    INITIAL_PLATFORM_COMMISSION
  );
  const [vendorCommissions, setVendorCommissions] = useState<VendorCommissionItem[]>(
    INITIAL_VENDOR_COMMISSIONS
  );
  const [categoryCommissions, setCategoryCommissions] = useState<CategoryCommissionItem[]>(
    INITIAL_CATEGORY_COMMISSIONS
  );

  const [editTarget, setEditTarget] = useState<EditModalTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Simulate skeleton loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenEditPlatform = () => {
    setEditTarget({
      type: 'platform',
      id: platformCommission.id,
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
      currentRate: item.rate,
      currentStatus: item.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditCategory = (item: CategoryCommissionItem) => {
    setEditTarget({
      type: 'category',
      id: item.id,
      name: item.categoryName,
      currentRate: item.rate,
      currentStatus: item.status,
    });
    setIsModalOpen(true);
  };

  const handleRequestConfirm = (
    id: string,
    type: 'platform' | 'vendor' | 'category',
    newRate: number,
    newStatus?: CommissionStatus
  ) => {
    setPendingChange({ id, type, newRate, newStatus });
    setIsConfirmOpen(true);
  };

  const handleConfirmRateChange = () => {
    if (!pendingChange) return;

    const { id, type, newRate, newStatus } = pendingChange;
    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'platform') {
      setPlatformCommission((prev) => ({
        ...prev,
        rate: newRate,
        lastUpdated: todayStr,
      }));
    } else if (type === 'vendor') {
      setVendorCommissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                rate: newRate,
                status: newStatus || item.status,
                lastUpdated: todayStr,
              }
            : item
        )
      );
    } else if (type === 'category') {
      setCategoryCommissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                rate: newRate,
                status: newStatus || item.status,
                lastUpdated: todayStr,
              }
            : item
        )
      );
    }

    toast.success(t('commissionRates.updateSuccess', 'Commission rate updated successfully!'));

    setIsConfirmOpen(false);
    setIsModalOpen(false);
    setPendingChange(null);
  };

  const handleExportExcel = () => {
    const headers = [
      { key: 'name' as const, label: 'Name / Type' },
      { key: 'rate' as const, label: 'Commission Rate (%)' },
      { key: 'status' as const, label: 'Status' },
      { key: 'lastUpdated' as const, label: 'Last Updated' },
    ];

    const exportData = [
      {
        name: 'Platform Default',
        rate: `${platformCommission.rate}%`,
        status: 'Global',
        lastUpdated: platformCommission.lastUpdated,
      },
      ...vendorCommissions.map((v) => ({
        name: v.vendorName,
        rate: `${v.rate}%`,
        status: v.status,
        lastUpdated: v.lastUpdated,
      })),
      ...categoryCommissions.map((c) => ({
        name: c.categoryName,
        rate: `${c.rate}%`,
        status: c.status,
        lastUpdated: c.lastUpdated,
      })),
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
      {
        name: 'Platform Default',
        rate: `${platformCommission.rate}%`,
        status: 'Global',
        lastUpdated: platformCommission.lastUpdated,
      },
      ...vendorCommissions.map((v) => ({
        name: v.vendorName,
        rate: `${v.rate}%`,
        status: v.status,
        lastUpdated: v.lastUpdated,
      })),
      ...categoryCommissions.map((c) => ({
        name: c.categoryName,
        rate: `${c.rate}%`,
        status: c.status,
        lastUpdated: c.lastUpdated,
      })),
    ];

    exportToPDF(
      t('commissionRates.title', 'Commission Rates'),
      headers,
      exportData
    );
  };

  return {
    isRtl,
    isLoading,
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
    handleExportExcel,
    handleExportPDF,
  };
}
