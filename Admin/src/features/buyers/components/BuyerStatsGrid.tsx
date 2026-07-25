import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

interface BuyerStatsGridProps {
  ordersNum: number;
  totalSpent: number;
  avgOrderValue: number;
  lastActive?: string;
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

  const stats = [
    {
      label: t('buyers.details.totalOrders', 'Total Orders'),
      value: ordersNum,
      unit: '',
    },
    {
      label: t('buyers.details.totalSpent', 'Total Spent'),
      value: (totalSpent ?? 0).toLocaleString(),
      unit: 'SAR',
    },
    {
      label: t('buyers.details.avgOrderValue', 'Average Order'),
      value: avgOrderValue.toLocaleString(),
      unit: 'SAR',
    },
    {
      label: t('buyers.details.lastActive', 'Last Active'),
      value: lastActive ?? '2 days ago',
      unit: '',
    },
  ];

  if (isMobile) {
    return (
      <motion.div variants={cardVariants} className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900">
              {stat.value}
              {stat.unit && <span className="text-xs font-normal text-gray-400 ms-1">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
          <p className="text-xl font-bold text-gray-900">
            {stat.value}
            {stat.unit && <span className="text-xs font-normal text-gray-400 ms-1">{stat.unit}</span>}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
