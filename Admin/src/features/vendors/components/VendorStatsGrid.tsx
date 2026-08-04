import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { StatCard, cardVariants } from './VendorDetailsCards';
import { useVendorPayoutStats } from '../hooks/useVendors';
import type { Vendor } from '../types/vendors';

interface VendorStatsGridProps {
  vendor: Vendor;
  vendorId?: string;
}

export default function VendorStatsGrid({ vendor, vendorId }: VendorStatsGridProps) {
  const { t } = useTranslation();
  const targetId = vendorId || vendor.id;

  const { data: stats, isLoading } = useVendorPayoutStats(targetId);

  const totalSales = stats?.totalSales ?? vendor.revenue ?? 0;
  const productCount = stats?.productCount ?? vendor.products ?? 0;
  const orderCount = stats?.orderCount ?? vendor.orders ?? 0;
  const totalDues = stats?.totalDues ?? vendor.totalDue ?? 0;
  const rawExpenses = (stats as any)?.expenses ?? (stats as any)?.invoices ?? vendor.invoices;
  const expenses = typeof rawExpenses === 'number' && rawExpenses > 0
    ? rawExpenses
    : typeof rawExpenses === 'string' && parseFloat(rawExpenses) > 0
    ? parseFloat(rawExpenses)
    : '--';
  const pendingPayouts = stats?.pendingPayouts ?? (stats as any)?.pendingPayout ?? vendor.pendingPayout ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm space-y-2">
            <div className="w-20 h-3 bg-gray-100 animate-pulse rounded" />
            <div className="w-28 h-6 bg-gray-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <StatCard label={t('vendors.details.totalSales')} value={totalSales} unit="SAR" />
      <StatCard label={t('vendors.details.products')} value={productCount} />
      <StatCard label={t('vendors.details.ordersCount')} value={orderCount} />
      <StatCard label={t('vendors.details.totalDue')} value={totalDues} unit="SAR" />
      <StatCard label={t('vendors.details.expenses', 'Expenses')} value={expenses} unit="SAR" />
      <StatCard
        label={t('vendors.details.pendingPayout')}
        value={pendingPayouts}
        unit="SAR"
        highlight
      />
    </motion.div>
  );
}
