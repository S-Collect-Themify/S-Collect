import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface VendorItem {
  id: number;
  name: string;
  revenue: number;
  orders: number;
  badgeKey: string;
  defaultBadge: string;
  badgeColor: string;
  bgColor: string;
  initials: string;
}

const TOP_VENDORS: VendorItem[] = [];

export default function TopPerformingVendorsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {t('dashboardOverview.topPerformingVendors', 'Top Performing Vendors')}
          </h2>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            {t('dashboardOverview.tableHeaders.activeVendors', { defaultValue: 'Active Vendors: --' })}
          </p>
        </div>
        <Link
          to="/vendors"
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <span>{t('dashboardOverview.viewAll', 'View All')}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform" />
        </Link>
      </div>

      {/* Table / Mobile Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
                <th className="px-5 py-3.5 text-start font-semibold">{t('dashboardOverview.tableHeaders.vendor', 'Vendor')}</th>
                <th className="px-5 py-3.5 text-start font-semibold">{t('dashboardOverview.tableHeaders.revenue', 'Revenue')}</th>
                <th className="px-5 py-3.5 text-start font-semibold">{t('dashboardOverview.tableHeaders.orders', 'Orders')}</th>
                <th className="px-5 py-3.5 text-start font-semibold">{t('dashboardOverview.tableHeaders.status', 'Status')}</th>
                <th className="px-5 py-3.5 text-end font-semibold">{t('dashboardOverview.tableHeaders.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {TOP_VENDORS.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-xs">
                    No top performing vendors found.
                  </td>
                </tr>
              ) : (
                TOP_VENDORS.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${v.bgColor}`}
                        >
                          {v.initials || '--'}
                        </div>
                        <span className="font-bold text-gray-900">{v.name || '--'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      SAR {v.revenue ? v.revenue.toLocaleString() : '--'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-medium">
                      {v.orders ? v.orders.toLocaleString() : '--'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${v.badgeColor}`}
                      >
                        {t(`dashboardOverview.tableHeaders.${v.badgeKey}`, v.defaultBadge || '--')}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {TOP_VENDORS.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-xs">
              No top performing vendors found.
            </div>
          ) : (
            TOP_VENDORS.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${v.bgColor}`}
                  >
                    {v.initials || '--'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-900 truncate">{v.name || '--'}</span>
                      <span className={`inline-flex px-2 py-0.2 rounded-full text-[10px] font-semibold shrink-0 ${v.badgeColor}`}>
                        {t(`dashboardOverview.tableHeaders.${v.badgeKey}`, v.defaultBadge || '--')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      <span className="font-bold text-gray-900">SAR {v.revenue ? v.revenue.toLocaleString() : '--'}</span> — {v.orders || '--'} {t('dashboardOverview.tableHeaders.orders', 'orders')}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
