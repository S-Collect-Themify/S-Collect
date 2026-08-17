import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTopPerformingVendors } from '../vendors/hooks/useVendors';

const avatarBgColors = [
  'bg-emerald-50 text-emerald-700',
  'bg-blue-50 text-blue-700',
  'bg-amber-50 text-amber-700',
  'bg-purple-50 text-purple-700',
  'bg-indigo-50 text-indigo-700',
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
  if (s === 'ACTIVE') {
    return {
      badgeClass: 'bg-emerald-100/80 text-emerald-700',
      labelKey: 'active',
      defaultLabel: 'Active',
    };
  }
  if (s === 'PENDING_APPROVAL' || s === 'PENDING') {
    return {
      badgeClass: 'bg-amber-100/80 text-amber-700',
      labelKey: 'pending',
      defaultLabel: 'Pending',
    };
  }
  if (s === 'REJECTED') {
    return {
      badgeClass: 'bg-rose-100/80 text-rose-700',
      labelKey: 'rejected',
      defaultLabel: 'Rejected',
    };
  }
  return {
    badgeClass: 'bg-gray-100 text-gray-700',
    labelKey: 'deactivated',
    defaultLabel: status || 'Deactivated',
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
        <h2 className="text-base font-bold text-gray-900">
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
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
                    <th className="px-5 py-3.5 text-start font-semibold">
                      {t('dashboardOverview.tableHeaders.vendor', 'Vendor')}
                    </th>
                    <th className="px-5 py-3.5 text-start font-semibold">
                      {t('dashboardOverview.tableHeaders.revenue', 'Revenue')}
                    </th>
                    <th className="px-5 py-3.5 text-start font-semibold">
                      {t('dashboardOverview.tableHeaders.orders', 'Orders')}
                    </th>
                    <th className="px-5 py-3.5 text-start font-semibold">
                      {t('dashboardOverview.tableHeaders.status', 'Status')}
                    </th>
                    <th className="px-5 py-3.5 text-end font-semibold">
                      {t('dashboardOverview.tableHeaders.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-xs">
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
                        <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${bgColor}`}
                              >
                                {initials}
                              </div>
                              <span className="font-bold text-gray-900">{name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">
                            SAR {revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700 font-medium">
                            {orders.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeInfo.badgeClass}`}
                            >
                              {t(`dashboardOverview.tableHeaders.${badgeInfo.labelKey}`, badgeInfo.defaultLabel)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-end">
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {vendors.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
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
                      key={v.id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${bgColor}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-gray-900 truncate">{name}</span>
                            <span
                              className={`inline-flex px-2 py-0.2 rounded-full text-[10px] font-semibold shrink-0 ${badgeInfo.badgeClass}`}
                            >
                              {t(`dashboardOverview.tableHeaders.${badgeInfo.labelKey}`, badgeInfo.defaultLabel)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            <span className="font-bold text-gray-900">
                              SAR {revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>{' '}
                            — {orders.toLocaleString()} {t('dashboardOverview.tableHeaders.orders', 'orders')}
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
