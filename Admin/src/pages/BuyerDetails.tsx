import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  useBuyerStore,
  BuyerProfileCard,
  BuyerStatsGrid,
  BuyerOrdersTable,
} from '../features/buyers';

// ── Motion variants ──────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ── Main Page Component ──────────────────────────────────────────────────────

export default function BuyerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const buyers = useBuyerStore((s) => s.buyers);

  const buyerId = id || '';
  const buyer = buyers.find((b) => b.id === buyerId);

  if (!buyer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('buyers.details.buyerNotFound', 'Buyer not found')}</p>
        <button
          onClick={() => navigate('/buyers')}
          className="text-sm underline text-gray-600 cursor-pointer font-medium"
        >
          {t('buyers.details.backToBuyers', 'Back to Buyers')}
        </button>
      </div>
    );
  }

  const numOrders =
    typeof buyer.ordersNum === 'number'
      ? buyer.ordersNum
      : parseInt(String(buyer.ordersNum || 0), 10) || 0;

  const avgOrderValue =
    numOrders > 0 && buyer.totalSpent
      ? Math.round(buyer.totalSpent / numOrders)
      : null;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Page Header Area ── */}
      <div className="sidebar-page-container-header bg-white border-b border-gray-200/80 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('buyers.details.breadcrumbCurrent', 'Buyer Details')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link
              to="/buyers"
              className="hover:underline cursor-pointer text-gray-500 font-medium"
            >
              {t('buyers.details.breadcrumbParent', 'Buyers')}
            </Link>
            <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
            <span className="text-gray-900 font-semibold">{buyer.name || '---'}</span>
          </div>
        </div>
      </div>

      {/* ── Main Body Container ── */}
      <div className="sidebar-page-container py-6 bg-[#F8F8F8]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* 1. Buyer Profile Card Component */}
          <BuyerProfileCard buyer={buyer} isMobile={isMobile} />

          {/* 2. Stats Grid Component */}
          <BuyerStatsGrid
            ordersNum={buyer.ordersNum ?? '---'}
            totalSpent={buyer.totalSpent}
            avgOrderValue={avgOrderValue}
            lastActive={buyer.lastActive}
            isMobile={isMobile}
          />

          {/* 3. Recent Orders Section Component */}
          <BuyerOrdersTable buyerAccountId={buyer.id} isMobile={isMobile} />
        </motion.div>
      </div>
    </div>
  );
}
