import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

interface BuyerStatsGridProps {
  ordersNum: number | string;
  totalSpent?: number | string | null;
  avgOrderValue?: number | string | null;
  lastActive?: string | null;
  isMobile: boolean;
}

export default function BuyerStatsGrid({
  ordersNum,
  totalSpent,
  avgOrderValue,
  lastActive,
  isMobile,
}: BuyerStatsGridProps) {
  const { t } = useTranslation();

  const formattedOrders = ordersNum ?? '---';
  const formattedSpent = totalSpent !== undefined && totalSpent !== null ? `${Number(totalSpent).toLocaleString()} SAR` : '---';
  const formattedAvg = avgOrderValue !== undefined && avgOrderValue !== null ? `${Number(avgOrderValue).toLocaleString()} SAR` : '---';
  const formattedActive = lastActive || '---';

  const stats = [
    {
      label: t('buyers.details.totalOrders', 'Total Orders'),
      value: formattedOrders,
    },
    {
      label: t('buyers.details.totalSpent', 'Total Spent'),
      value: formattedSpent,
    },
    {
      label: t('buyers.details.avgOrderValue', 'Average Order'),
      value: formattedAvg,
    },
    {
      label: t('buyers.details.lastActive', 'Last Active'),
      value: formattedActive,
    },
  ];

  if (isMobile) {
    return (
      <motion.div variants={cardVariants} className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </motion.div>
  );
}
