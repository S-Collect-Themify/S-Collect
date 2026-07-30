import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import {
  useSubOrder,
  useUpdateSubOrder,
} from '../features/Orders/useSubOrders';
import type { SubOrderStatus } from '../features/Orders/types/subOrder';

// Child components
import { SubOrderItems } from '../features/SubOrder/SubOrderItems';
import { SubOrderTimeline } from '../features/SubOrder/SubOrderTimeline';
import { SubOrderInfo } from '../features/SubOrder/SubOrderInfo';
import { SubOrderSummary } from '../features/SubOrder/SubOrderSummary';
import { SubOrderStatusUpdate } from '../features/SubOrder/SubOrderStatusUpdate';
import { useTranslation } from 'react-i18next';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

const SubOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: order, isLoading, isError, refetch } = useSubOrder(id ?? null);
  const { mutate: updateOrder, isPending, isSuccess } = useUpdateSubOrder();

  const goBack = () => navigate('/incoming-orders');

  // ── Loading & Errors ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-red-500 text-sm">Failed to load order details.</p>
        <button
          onClick={() => refetch()}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const itemsTotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  const grandTotal = itemsTotal + order.shippingRateApplied;

  const handleUpdateStatus = (
    newStatus: SubOrderStatus | null,
    tracking: string
  ) => {
    const body: { status?: SubOrderStatus; trackingNumber?: string } = {};
    if (newStatus && newStatus !== order.status) {
      body.status = newStatus;
    }
    if (tracking.trim()) {
      body.trackingNumber = tracking.trim();
    }
    if (Object.keys(body).length === 0) return;
    updateOrder({ id: order.id, body });
  };

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f5f7fb]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="flex items-center gap-3 mb-1"
      >
        <button
          onClick={goBack}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300"
        >
          <ArrowLeft size={17} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('ordersPage.orderDetails')}{' '}
            <span className="text-gray-500 font-semibold">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </h1>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <span className="text-gray-800 font-medium">
              {t('ordersPage.title')}
            </span>
            <ChevronsRight size={12} />
            <span>{t('ordersPage.orderDetails')}</span>
          </p>
        </div>
      </motion.div>

      {/* ── Two-column grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 mt-5">
        {/* ══ LEFT ════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          <motion.div variants={cardVariants}>
            <SubOrderItems items={order.items} />
          </motion.div>

          <motion.div variants={cardVariants}>
            <SubOrderTimeline
              status={order.status}
              createdAt={order.createdAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              statusOverrideReason={order.statusOverrideReason}
            />
          </motion.div>
        </div>

        {/* ══ RIGHT ═══════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">
          <motion.div variants={cardVariants}>
            <SubOrderInfo
              id={order.id}
              orderNumber={order.orderNumber}
              createdAt={order.createdAt}
              trackingNumber={order.trackingNumber}
              status={order.status}
              customer={order.customer}
            />
          </motion.div>

          <motion.div variants={cardVariants}>
            <SubOrderSummary
              itemsTotal={itemsTotal}
              shippingRateApplied={order.shippingRateApplied}
              grandTotal={grandTotal}
            />
          </motion.div>

          {order.status !== 'CANCELLED' && (
            <motion.div variants={cardVariants}>
              <SubOrderStatusUpdate
                currentStatus={order.status}
                isPending={isPending}
                isSuccess={isSuccess}
                onUpdateStatus={handleUpdateStatus}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SubOrderDetails;
