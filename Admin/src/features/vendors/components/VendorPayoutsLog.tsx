import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useVendorPayouts } from '../hooks/useVendors';
import type { Vendor } from '../types/vendors';

interface VendorPayoutsLogProps {
  vendor: Vendor;
  vendorId?: string;
}

export interface PayoutItem {
  id: string;
  date: string;
  amount: number;
  referenceNumber: string;
  adminName: string;
  status: 'completed' | 'accepted' | 'pending' | 'rejected';
}

export default function VendorPayoutsLog({ vendor, vendorId }: VendorPayoutsLogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const targetId = vendorId || vendor.id;

  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-12-31');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: apiPayoutsData, isLoading } = useVendorPayouts(targetId, page, itemsPerPage);

  const PAYOUT_STATUS_STYLES: Record<string, { label: string; className: string }> = useMemo(
    () => ({
      completed: {
        label: t('vendors.payoutsLog.statusCompleted', 'Completed'),
        className: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      },
      accepted: {
        label: t('vendors.payoutsLog.statusCompleted', 'Completed'),
        className: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      },
      pending: {
        label: t('vendors.payoutsLog.statusPending', 'Pending'),
        className: 'bg-amber-50 text-amber-600 border border-amber-100',
      },
      rejected: {
        label: t('vendors.payoutsLog.statusRejected', 'Rejected'),
        className: 'bg-red-50 text-red-600 border border-red-100',
      },
    }),
    [t]
  );

  // Map API items (without mock data fallbacks)
  const rawItems: PayoutItem[] = useMemo(() => {
    const apiData = apiPayoutsData as any;
    const items: any[] = Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.items)
      ? apiData.items
      : Array.isArray(apiData?.data)
      ? apiData.data
      : Array.isArray(apiData?.data?.items)
      ? apiData.data.items
      : [];

    return items.map((item: any, idx: number) => {
      const idStr = item.id ? String(item.id) : `${idx + 1}`;
      const formattedId = idStr.startsWith('#')
        ? idStr
        : `#PAY-${idStr.slice(-4).padStart(4, '0').toUpperCase()}`;
      const dateStr = item.createdAt || item.transferDate
        ? new Date(item.createdAt || item.transferDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '--';

      return {
        id: formattedId,
        date: dateStr,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
        referenceNumber: item.referenceNumber || item.referenceNo || '--',
        adminName: item.adminName || item.processedBy || item.admin || '--',
        status: (item.status ? String(item.status).toLowerCase() : 'completed') as any,
      };
    });
  }, [apiPayoutsData]);

  // Date Filter logic
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (!appliedFrom && !appliedTo) return true;
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return true;

      if (appliedFrom) {
        const from = new Date(appliedFrom);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }
      if (appliedTo) {
        const to = new Date(appliedTo);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }
      return true;
    });
  }, [rawItems, appliedFrom, appliedTo]);

  // Stat calculations
  const totalPayoutsSum = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + item.amount, 0);
  }, [filteredItems]);

  const pendingAmountSum = useMemo(() => {
    return filteredItems
      .filter((item) => item.status === 'pending')
      .reduce((acc, item) => acc + item.amount, 0);
  }, [filteredItems]);

  const lastPayoutDate = useMemo(() => {
    return filteredItems[0]?.date || '--';
  }, [filteredItems]);

  // Pagination from API metadata or calculated
  const apiData = apiPayoutsData as any;
  const totalCount = apiData?.pagination?.totalItems ?? apiData?.total ?? filteredItems.length;
  const totalPages = apiData?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    // If backend already paginates, use filteredItems directly; otherwise slice client-side
    if (apiData?.pagination?.totalItems !== undefined) {
      return filteredItems;
    }
    const start = (safePage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, safePage, itemsPerPage, apiData]);

  const handleFilter = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setPage(1);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Payouts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <p className="text-xs text-gray-400 font-medium mb-2">
            {t('vendors.payoutsLog.totalPayouts', 'Total Payouts')}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-600">
              {totalPayoutsSum.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-emerald-600">SAR</span>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <p className="text-xs text-gray-400 font-medium mb-2">
            {t('vendors.payoutsLog.pendingAmount', 'Pending Amount')}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-500">
              {pendingAmountSum.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-amber-500">SAR</span>
          </div>
        </div>

        {/* Last Payout Date */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs">
          <p className="text-xs text-gray-400 font-medium mb-2">
            {t('vendors.payoutsLog.lastPayoutDate', 'Last Payout Date')}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {lastPayoutDate}
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              {t('vendors.ordersLog.fromDate', 'From Date')}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-3 text-xs text-gray-800 bg-gray-50/50 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              {t('vendors.ordersLog.toDate', 'To Date')}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-3 text-xs text-gray-800 bg-gray-50/50 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <button
            onClick={handleFilter}
            className="w-full md:w-auto h-11 px-8 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
          >
            {t('vendors.ordersLog.filter', 'Filter')}
          </button>
        </div>
      </div>

      {/* Payouts Log Table / Cards */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden mb-6">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-start">
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colPayoutId', 'Payout ID')}
                </th>
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colDate', 'Date')}
                </th>
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colAmount', 'Amount')}
                </th>
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colRefNo', 'Reference Number')}
                </th>
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colAdmin', 'Admin Name')}
                </th>
                <th className="px-6 py-4 text-start font-bold text-gray-900">
                  {t('vendors.payoutsLog.colStatus', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-6 py-4"><div className="w-20 h-4 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-5 rounded-full bg-gray-100 animate-pulse" /></td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-gray-400">
                    {t('vendors.payoutsLog.noPayoutsFound', 'No payouts found for this vendor.')}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((payout) => {
                  const style = PAYOUT_STATUS_STYLES[payout.status] || {
                    label: payout.status,
                    className: 'bg-gray-100 text-gray-700',
                  };

                  return (
                    <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-amber-500 text-xs">
                        {payout.id}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {payout.date}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-xs">
                        SAR {payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                        {payout.referenceNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                        {payout.adminName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${style.className}`}>
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="w-24 h-4 rounded bg-gray-100 animate-pulse" />
                <div className="w-32 h-4 rounded bg-gray-100 animate-pulse" />
              </div>
            ))
          ) : paginatedItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              {t('vendors.payoutsLog.noPayoutsFound', 'No payouts found for this vendor.')}
            </div>
          ) : (
            paginatedItems.map((payout) => {
              const style = PAYOUT_STATUS_STYLES[payout.status] || {
                label: payout.status,
                className: 'bg-gray-100 text-gray-700',
              };

              return (
                <div key={payout.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500">{payout.id}</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.className}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{payout.date}</p>
                  <p className="text-base font-bold text-gray-900">
                    SAR {payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                    <span>Ref Number: <strong className="text-gray-700">{payout.referenceNumber}</strong></span>
                    <span>Admin: <strong className="text-gray-700">{payout.adminName}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing {Math.min((safePage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(safePage * itemsPerPage, totalCount)} of {totalCount} payouts
            </div>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    safePage === pNum
                      ? 'bg-black text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="px-3 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                Next <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
