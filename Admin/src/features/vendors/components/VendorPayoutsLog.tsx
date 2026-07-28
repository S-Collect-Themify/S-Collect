import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useVendorPayoutsStore } from '../../../store/vendorPayoutsStore';
import { VENDOR_MOCK_PAYOUTS, type MockPayout } from '../data/constant';
import type { Vendor } from '../types/vendors';

const ITEMS_PER_PAGE = 5;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

interface VendorPayoutsLogProps {
  vendor: Vendor;
  vendorId: string;
}

export default function VendorPayoutsLog({ vendor, vendorId }: VendorPayoutsLogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const PAYOUT_STATUS_STYLES: Record<
    MockPayout['status'],
    { label: string; className: string }
  > = useMemo(() => ({
    completed: { label: t('vendors.payoutsLog.statusCompleted', 'Completed'), className: 'bg-green-100 text-green-700' },
    accepted: { label: t('vendors.payoutsLog.statusCompleted', 'Completed'), className: 'bg-green-100 text-green-700' },
    pending: { label: t('vendors.payoutsLog.statusPending', 'Pending'), className: 'bg-amber-100 text-amber-700' },
    rejected: { label: t('vendors.payoutsLog.statusRejected', 'Rejected'), className: 'bg-red-100 text-red-700' },
  }), [t]);

  const allPayouts: MockPayout[] = VENDOR_MOCK_PAYOUTS[vendorId as unknown as keyof typeof VENDOR_MOCK_PAYOUTS] ?? [];

  // ── Zustand state ──
  const appliedFrom  = useVendorPayoutsStore((s) => s.appliedFrom);
  const appliedTo    = useVendorPayoutsStore((s) => s.appliedTo);
  const statusFilter = useVendorPayoutsStore((s) => s.statusFilter);
  const search       = useVendorPayoutsStore((s) => s.search);
  const page         = useVendorPayoutsStore((s) => s.page);

  const setStatusFilter = useVendorPayoutsStore((s) => s.setStatusFilter);
  const setSearch       = useVendorPayoutsStore((s) => s.setSearch);
  const setPage         = useVendorPayoutsStore((s) => s.setPage);
  const applyFilter     = useVendorPayoutsStore((s) => s.applyFilter);
  const resetStore      = useVendorPayoutsStore((s) => s.reset);

  const [fromDate, setFromDate] = useState(appliedFrom);
  const [toDate,   setToDate]   = useState(appliedTo);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [page, appliedFrom, appliedTo, statusFilter, search]);

  const filtered = useMemo(() => {
    return allPayouts.filter((p) => {
      const pDate = new Date(p.date);

      if (appliedFrom) {
        const from = new Date(appliedFrom);
        from.setHours(0, 0, 0, 0);
        if (!isNaN(pDate.getTime()) && pDate < from) return false;
      }

      if (appliedTo) {
        const to = new Date(appliedTo);
        to.setHours(23, 59, 59, 999);
        if (!isNaN(pDate.getTime()) && pDate > to) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && !(p.status === 'completed' || p.status === 'accepted')) return false;
        if (statusFilter === 'pending' && p.status !== 'pending') return false;
        if (statusFilter === 'rejected' && p.status !== 'rejected') return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          p.id.toLowerCase().includes(q) ||
          p.referenceNumber.toLowerCase().includes(q) ||
          p.adminName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allPayouts, appliedFrom, appliedTo, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalPayoutAmount = filtered.reduce((acc, p) => acc + p.amount, 0);
  const pendingPayoutAmount = filtered
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleFilter = () => applyFilter(fromDate, toDate);

  const handleReset = () => {
    const DEFAULT_FROM = '2024-01-01';
    const DEFAULT_TO   = '2026-12-31';
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
    resetStore();
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 3 Stat Cards Row */}
      <motion.div
        variants={cardVariants}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.payoutsLog.totalPayouts', 'Total Payouts')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {(vendor.invoices ?? filtered.length).toLocaleString('en-US')}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.payoutsLog.totalAmountPaid', 'Total Amount Paid')}</p>
          <p className="text-2xl font-bold text-green-600">
            {totalPayoutAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-normal text-green-600">SAR</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.payoutsLog.pendingPayouts', 'Pending Payout Amount')}</p>
          <p className="text-2xl font-bold text-amber-500">
            {(vendor.pendingPayout ?? pendingPayoutAmount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-normal text-amber-500">SAR</span>
          </p>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex items-end gap-4 flex-wrap"
      >
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">{t('vendors.table.search', 'Search')}</label>
          <input
            type="text"
            placeholder={t('vendors.payoutsLog.searchPlaceholder', 'Payout ID, Ref No, Admin...')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-xs text-gray-700 outline-none focus:border-gray-400 transition-colors bg-gray-50/50"
          />
        </div>
        <div className="w-35">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">{t('vendors.table.statusFilter', 'Status')}</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-xs text-gray-700 outline-none focus:border-gray-400 transition-colors bg-gray-50/50"
          >
            <option value="all">{t('vendors.payoutsLog.allStatuses', 'All Statuses')}</option>
            <option value="completed">{t('vendors.payoutsLog.statusCompleted', 'Completed')}</option>
            <option value="pending">{t('vendors.payoutsLog.statusPending', 'Pending')}</option>
            <option value="rejected">{t('vendors.payoutsLog.statusRejected', 'Rejected')}</option>
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">{t('vendors.ordersLog.fromDate', 'From Date')}</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-xs text-gray-700 outline-none focus:border-gray-400 transition-colors bg-gray-50/50"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">{t('vendors.ordersLog.toDate', 'To Date')}</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-xs text-gray-700 outline-none focus:border-gray-400 transition-colors bg-gray-50/50"
          />
        </div>
        <button
          onClick={handleFilter}
          className="h-10 px-6 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
        >
          {t('vendors.ordersLog.filter', 'Filter')}
        </button>
        <button
          onClick={handleReset}
          className="h-10 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
        >
          {t('vendors.ordersLog.reset', 'Reset')}
        </button>
      </motion.div>

      {/* Payouts Table */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-100">
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colPayoutId', 'Payout ID')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colRefNo', 'Reference No')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colAmount', 'Amount (SAR)')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colAdmin', 'Admin Name')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colStatus', 'Status')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.payoutsLog.colDate', 'Date')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-5 py-4"><div className="w-24 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-28 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-24 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 rounded-full bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-gray-400">
                    {t('vendors.payoutsLog.noPayoutsFound', 'No payouts found for the applied filter.')}
                  </td>
                </tr>
              ) : (
                paginated.map((payout) => {
                  const style = PAYOUT_STATUS_STYLES[payout.status];
                  return (
                    <tr key={payout.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-gray-900">
                        {payout.id}
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {payout.referenceNumber}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">
                        {payout.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        SAR
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {payout.adminName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {payout.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
