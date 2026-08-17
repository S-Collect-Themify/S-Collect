import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, ArrowRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  getVouchersList,
  getVoucherStatsApi,
  type BackendVoucherItem,
} from '../../services/vouchers';

function getVoucherStatusBadge(v: BackendVoucherItem, t: any) {
  const uses = Number(v.usesCount ?? 0);
  const maxUses = v.maxTotalUses !== undefined && v.maxTotalUses !== null ? Number(v.maxTotalUses) : NaN;
  const isLimitReached = !isNaN(maxUses) && maxUses > 0 && uses >= maxUses;
  const isExpired = v.endsAt ? new Date(v.endsAt) < new Date() : false;

  if (isLimitReached) {
    return {
      badgeClass: 'bg-amber-100/80 text-amber-700',
      label: t('dashboardOverview.tableHeaders.limitReached', 'Limit Reached'),
    };
  }

  if (v.isActive === false || v.status === 'INACTIVE' || isExpired) {
    return {
      badgeClass: 'bg-rose-100/80 text-rose-600',
      label: t('dashboardOverview.tableHeaders.expired', 'Expired'),
    };
  }

  return {
    badgeClass: 'bg-emerald-100/80 text-emerald-700',
    label: t('dashboardOverview.tableHeaders.active', 'Active'),
  };
}

export default function VoucherOverviewSection() {
  const { t } = useTranslation();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-vouchers-stats'],
    queryFn: getVoucherStatsApi,
  });

  const { data: vouchersResponse, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ['admin-vouchers-dashboard'],
    queryFn: () => getVouchersList({ pageNum: 1, pageSize: 5 }),
  });

  const rawItems: BackendVoucherItem[] = Array.isArray(vouchersResponse?.items)
    ? vouchersResponse.items
    : Array.isArray(vouchersResponse?.data?.items)
    ? vouchersResponse.data.items
    : Array.isArray(vouchersResponse?.data)
    ? vouchersResponse.data
    : Array.isArray(vouchersResponse)
    ? vouchersResponse
    : [];

  const vouchers = rawItems.slice(0, 5);

  const activeVouchersCount = stats?.totalActiveVouchers ?? 0;
  const totalCostSaved = stats?.totalCostSavedThisMonth !== undefined
    ? stats.totalCostSavedThisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : '0';
  const redemptionsThisMonth = stats?.totalUsagesThisMonth !== undefined
    ? stats.totalUsagesThisMonth.toLocaleString()
    : '0';

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {t('dashboardOverview.voucherOverview', 'Voucher Overview')}
        </h2>
        <Link
          to="/vouchers"
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <span>{t('dashboardOverview.viewAll', 'View All')}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform" />
        </Link>
      </div>

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Active Vouchers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-semibold mb-3">
            <Package size={18} className="shrink-0" />
            <span>{t('dashboardOverview.activeVouchers', 'Active Vouchers')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
              {isLoadingStats ? (
                <Loader2 className="animate-spin text-gray-400" size={20} />
              ) : (
                activeVouchersCount
              )}
            </span>
          </div>
        </div>

        {/* Total Voucher Costs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 text-blue-600 text-xs sm:text-sm font-semibold mb-3">
            <TrendingUp size={18} className="shrink-0" />
            <span>{t('dashboardOverview.totalVoucherCosts', 'Total Voucher Costs')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                SAR {isLoadingStats ? '...' : totalCostSaved}
              </span>
              <span className="text-[10px] font-bold text-gray-600">SAR</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
              {t('dashboardOverview.platformMarketingExpense', 'Platform Marketing Expense')}
            </span>
          </div>
        </div>

        {/* Redemptions This Month */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-semibold mb-3">
            <Package size={18} className="shrink-0" />
            <span>{t('dashboardOverview.redemptionsThisMonth', 'Redemptions This Month')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
              {isLoadingStats ? (
                <Loader2 className="animate-spin text-gray-400" size={20} />
              ) : (
                redemptionsThisMonth
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Voucher Table / Mobile Cards Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {isLoadingVouchers ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-gray-500" size={20} />
            <span className="text-xs font-medium">Loading vouchers...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[11px]">
                    <th className="w-[40%] px-6 py-4 text-start font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.code', 'Code')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.type', 'Type')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.discount', 'Discount')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.usage', 'Usage')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.expiry', 'Expiry')}
                    </th>
                    <th className="w-[12%] px-6 py-4 text-end font-semibold uppercase tracking-wider">
                      {t('dashboardOverview.tableHeaders.status', 'Status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-xs">
                        No vouchers found.
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v) => {
                      const isPercentage = v.type === 'PERCENTAGE';
                      const discountStr = isPercentage ? `${v.value ?? 0}%` : `SAR ${v.value ?? 0}`;
                      const usageStr = `${v.usesCount ?? 0}/${v.maxTotalUses ? v.maxTotalUses : '∞'}`;
                      const expiryStr = v.endsAt ? String(v.endsAt).split('T')[0] : '--';
                      const badgeInfo = getVoucherStatusBadge(v, t);

                      return (
                        <tr key={v.id || v.code} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 text-xs text-start tracking-wide">
                            {v.code || '--'}
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-normal text-xs text-end">
                            {isPercentage
                              ? t('dashboardOverview.tableHeaders.percentage', 'Percentage')
                              : t('dashboardOverview.tableHeaders.fixedAmount', 'Amount')}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 text-xs text-end">
                            {discountStr}
                          </td>
                          <td className="px-6 py-4 text-gray-400 font-normal text-xs text-end">
                            {usageStr}
                          </td>
                          <td className="px-6 py-4 text-gray-400 font-normal text-xs text-end">
                            {expiryStr}
                          </td>
                          <td className="px-6 py-4 text-end">
                            <span
                              className={`inline-flex px-3 py-0.5 rounded-full text-[11px] font-semibold ${badgeInfo.badgeClass}`}
                            >
                              {badgeInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3 p-3 bg-gray-50/30">
              {vouchers.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs bg-white rounded-2xl border border-gray-100">
                  No vouchers found.
                </div>
              ) : (
                vouchers.map((v) => {
                  const isPercentage = v.type === 'PERCENTAGE';
                  const discountStr = isPercentage ? `${v.value ?? 0}%` : `SAR ${v.value ?? 0}`;
                  const usageStr = `${v.usesCount ?? 0}/${v.maxTotalUses ? v.maxTotalUses : '∞'}`;
                  const expiryStr = v.endsAt ? String(v.endsAt).split('T')[0] : '--';
                  const badgeInfo = getVoucherStatusBadge(v, t);

                  return (
                    <div
                      key={v.id || v.code}
                      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900 tracking-wide">
                          {v.code || '--'}
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeInfo.badgeClass}`}
                        >
                          {badgeInfo.label}
                        </span>
                      </div>

                      <div className="border-t border-gray-100/80 pt-2 grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[11px] text-gray-400 font-normal">
                            {t('dashboardOverview.tableHeaders.discountType', 'Discount Type')}
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-0.5">
                            {isPercentage
                              ? t('dashboardOverview.tableHeaders.percentage', 'Percentage')
                              : t('dashboardOverview.tableHeaders.fixedAmount', 'Amount')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-normal">
                            {t('dashboardOverview.tableHeaders.discount', 'Discount')}
                          </p>
                          <p className="text-xs font-bold text-gray-900 mt-0.5">
                            {discountStr}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-normal">
                            {t('dashboardOverview.tableHeaders.usageExpiry', 'Usage / Expiry')}
                          </p>
                          <p className="text-xs font-medium text-gray-600 mt-0.5 truncate">
                            {usageStr} • {expiryStr}
                          </p>
                        </div>
                      </div>
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
