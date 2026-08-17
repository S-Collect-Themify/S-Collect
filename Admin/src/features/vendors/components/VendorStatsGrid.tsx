import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { StatCard, cardVariants } from './VendorDetailsCards';
import { useVendorPayoutStats } from '../hooks/useVendors';
import type { Vendor } from '../types/vendors';

interface VendorStatsGridProps {
  vendor: Vendor;
  vendorId?: string;
}

function parseStatValue(val?: number | string | null, fallbackVal?: number | string | null): number | string {
  const target = val !== undefined && val !== null ? val : fallbackVal;
  if (target === undefined || target === null || target === '' || target === '--') {
    return '--';
  }
  if (typeof target === 'number') {
    return !isNaN(target) ? target : '--';
  }
  const parsed = Number(target);
  return !isNaN(parsed) ? parsed : String(target);
}

export default function VendorStatsGrid({ vendor, vendorId }: VendorStatsGridProps) {
  const { t } = useTranslation();
  const targetId = vendorId || vendor.id;

  const { data: stats, isLoading } = useVendorPayoutStats(targetId);

  const totalSales = parseStatValue(stats?.totalSales, vendor.revenue);
  const productCount = parseStatValue(stats?.productCount, vendor.products);
  const orderCount = parseStatValue(stats?.orderCount, vendor.orders);
  const totalDues = parseStatValue(stats?.totalDues ?? (stats as any)?.totalDue, vendor.totalDue);
  const rawExpenses = (stats as any)?.expenses ?? (stats as any)?.invoices;
  const expenses = parseStatValue(rawExpenses, vendor.invoices);
  const pendingPayouts = parseStatValue(stats?.pendingPayouts ?? (stats as any)?.pendingPayout, vendor.pendingPayout);

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
