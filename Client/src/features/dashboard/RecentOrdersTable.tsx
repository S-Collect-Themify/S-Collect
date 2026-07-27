import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useSubOrders } from '../Orders/useSubOrders';
import type { SubOrderStatus } from '../Orders/types/subOrder';
import MobileOrderCards from './components/MobileOrderCards';
import RecentOrdersSkeleton from './components/RecentOrdersSkeleton';
import RecentOrdersDesktopTable from './components/RecentOrdersDesktopTable';

const RecentOrdersTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const { data, isLoading, isError } = useSubOrders({
    pageNum: 1,
    pageSize: 5,
  });

  const recentOrders = [...(data?.items ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const getStatusLabel = (status: SubOrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return t('ordersPage.delivered', 'Delivered');
      case 'SHIPPED':
        return t('ordersPage.shipped', 'Shipped');
      case 'PROCESSING':
        return t('ordersPage.processing', 'Processing');
      case 'PENDING':
        return t('ordersPage.pending', 'Pending');
      case 'CANCELLED':
        return t('ordersPage.cancelled', 'Cancelled');
      default:
        return status;
    }
  };

  const handleViewAll = () => {
    navigate('/incoming-orders');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/incoming-orders/${id}`);
  };

  return (
    <>
      {isMobile ? (
        /* ── Mobile: card list ── */
        <div>
          <div className="flex items-center justify-between mb-4 tbl-animate-in">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('recentOrders.title', 'Recent Orders')}
            </h2>
            <button
              onClick={handleViewAll}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              {t('recentOrders.viewAll', 'View All')}
              <span className="inline-block rtl:rotate-180">→</span>
            </button>
          </div>
          {isLoading ? (
            <RecentOrdersSkeleton />
          ) : isError ? (
            <div className="p-4 bg-white rounded-xl text-center text-xs text-red-500">
              {t('ordersPage.loadError', 'Failed to load orders.')}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-4 bg-white rounded-xl text-center text-xs text-gray-500">
              {t('recentOrders.noOrders', 'No recent orders found.')}
            </div>
          ) : (
            <MobileOrderCards
              orders={recentOrders}
              getStatusLabel={getStatusLabel}
              t={t}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white min-h-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 tbl-animate-in">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('recentOrders.title', 'Recent Orders')}
            </h2>
            <button
              onClick={handleViewAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              {t('recentOrders.viewAll', 'View All')}
              <span className="inline-block rtl:rotate-180">→</span>
            </button>
          </div>

          {/* Table / Content */}
          {isLoading ? (
            <RecentOrdersSkeleton />
          ) : isError ? (
            <div className="p-8 text-center text-red-500 text-sm">
              {t('ordersPage.loadError', 'Failed to load orders.')}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {t('recentOrders.noOrders', 'No recent orders found.')}
            </div>
          ) : (
            <RecentOrdersDesktopTable
              orders={recentOrders}
              getStatusLabel={getStatusLabel}
              t={t}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      )}
    </>
  );
};

export default RecentOrdersTable;
