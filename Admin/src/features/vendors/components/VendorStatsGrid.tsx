import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { StatCard, cardVariants } from './VendorDetailsCards';
import type { Vendor } from '../types/vendors';

interface VendorStatsGridProps {
  vendor: Vendor;
}

export default function VendorStatsGrid({ vendor }: VendorStatsGridProps) {
  const { t } = useTranslation();

  return (
    <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <StatCard label={t('vendors.details.totalSales')} value={vendor.revenue ?? 0} unit="SAR" />
      <StatCard label={t('vendors.details.products')} value={vendor.products ?? 0} />
      <StatCard label={t('vendors.details.ordersCount')} value={vendor.orders ?? 0} />
      <StatCard label={t('vendors.details.totalDue')} value={vendor.totalDue ?? 0} unit="SAR" />
      <StatCard label={t('vendors.details.invoices')} value={vendor.invoices ?? 0} unit="SAR" />
      <StatCard
        label={t('vendors.details.pendingPayout')}
        value={vendor.pendingPayout ?? 0}
        unit="SAR"
        highlight
      />
    </motion.div>
  );
}
