import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTopPerformingVendors } from '../vendors/hooks/useVendors';

const avatarBgColors = [
  'bg-slate-800 text-white',
  'bg-blue-900 text-white',
  'bg-amber-100 text-amber-800',
  'bg-emerald-800 text-white',
  'bg-teal-700 text-white',
];

function getInitials(name: string): string {
  if (!name || name === '---') return '--';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getStatusBadgeInfo(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE' || s === 'TOP_RATED') {
    return {
      badgeClass: 'bg-emerald-100/80 text-emerald-700',
      label: 'Active',
    };
  }
  if (s === 'VERIFIED') {
    return {
      badgeClass: 'bg-blue-100/80 text-blue-700',
      label: 'Verified',
    };
  }
  if (s === 'GROWTH' || s === 'ON_GROWTH') {
    return {
      badgeClass: 'bg-amber-100/80 text-amber-700',
      label: 'On Growth',
    };
  }
  if (s === 'PENDING_APPROVAL' || s === 'PENDING') {
    return {
      badgeClass: 'bg-amber-100/80 text-amber-700',
      label: 'Pending',
    };
  }
  return {
    badgeClass: 'bg-gray-100 text-gray-600',
    label: status || 'Inactive',
  };
}

export default function TopPerformingVendorsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useTopPerformingVendors({ pageNum: 1, pageSize: 5 });
  const vendors = (data?.items || []).slice(0, 5);
  const totalActive = data?.pagination?.totalItems ?? vendors.length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {t('dashboardOverview.topPerformingVendors', 'Top Performing Vendors')}
        </h2>
        <span className="text-xs font-semibold text-gray-500">
          {t('dashboardOverview.tableHeaders.activeVendors', {
            defaultValue: `Active Vendors: ${isLoading ? '...' : totalActive}`,
            count: totalActive,
          })}
        </span>
      </div>

      {/* Table / Mobile Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-gray-500" size={20} />
            <span className="text-xs font-medium">Loading top performing vendors...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[11px]">
                    <th className="w-[45%] px-6 py-4 text-start font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.vendor', 'Vendor')}
                    </th>
                    <th className="w-[15%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.revenue', 'Revenue')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.orders', 'Orders')}
                    </th>
                    <th className="w-[16%] px-6 py-4 text-center font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.status', 'Status')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-xs">
                        No top performing vendors found.
                      </td>
                    </tr>
                  ) : (
                    vendors.map((v, idx) => {
                      const name = v.storeName || `${v.firstName || ''} ${v.lastName || ''}`.trim() || '---';
                      const initials = getInitials(name);
                      const revenue = typeof v.totalRevenue === 'number' ? v.totalRevenue : 0;
                      const orders = typeof v.deliveredOrders === 'number' ? v.deliveredOrders : 0;
                      const badgeInfo = getStatusBadgeInfo(v.status);
                      const bgColor = avatarBgColors[idx % avatarBgColors.length];

                      return (
                        <tr key={v.id || idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${bgColor}`}
                              >
                                {initials}
                              </div>
                              <span className="font-bold text-gray-900 text-xs">{name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 text-xs text-end">
                            SAR {revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-normal text-xs text-end">
                            {orders.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-3 py-0.5 rounded-full text-[11px] font-semibold ${badgeInfo.badgeClass}`}
                            >
                              {badgeInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-end">
                            <button
                              onClick={() => navigate(`/vendors/${v.id}`)}
                              className="text-blue-600 font-semibold hover:underline text-xs cursor-pointer"
                            >
                              {t('dashboardOverview.tableHeaders.view', 'View')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 p-3 bg-gray-50/30">
              {vendors.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs bg-white rounded-2xl border border-gray-100">
                  No top performing vendors found.
                </div>
              ) : (
                vendors.map((v, idx) => {
                  const name = v.storeName || `${v.firstName || ''} ${v.lastName || ''}`.trim() || '---';
                  const initials = getInitials(name);
                  const revenue = typeof v.totalRevenue === 'number' ? v.totalRevenue : 0;
                  const orders = typeof v.deliveredOrders === 'number' ? v.deliveredOrders : 0;
                  const badgeInfo = getStatusBadgeInfo(v.status);
                  const bgColor = avatarBgColors[idx % avatarBgColors.length];

                  return (
                    <div
                      key={v.id || idx}
                      className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${bgColor}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-900 truncate">{name}</span>
                            <span
                              className={`inline-flex px-2 py-0.2 rounded-full text-[10px] font-semibold shrink-0 ${badgeInfo.badgeClass}`}
                            >
                              {badgeInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            <span className="font-bold text-gray-900">
                              SAR {revenue.toLocaleString()}
                            </span>{' '}
                            • {orders.toLocaleString()} {t('dashboardOverview.tableHeaders.orders', 'orders')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/vendors/${v.id}`)}
                        className="text-blue-600 font-semibold text-xs hover:underline shrink-0 cursor-pointer"
                      >
                        {t('dashboardOverview.tableHeaders.view', 'View')}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
