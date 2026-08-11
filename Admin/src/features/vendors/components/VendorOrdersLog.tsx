import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useVendorOrdersStore } from '../../../store/vendorOrdersStore';
import type { Vendor } from '../types/vendors';

const ITEMS_PER_PAGE = 7;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

export interface VendorOrderItem {
  id: string;
  customer: string;
  vendorName: string;
  total: number;
  status: 'delivered' | 'canceled' | 'shipped';
  subOrders: number;
  date: string;
}

interface VendorOrdersLogProps {
  vendor: Vendor;
}

export default function VendorOrdersLog({ vendor }: VendorOrdersLogProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const ORDER_STATUS_STYLES: Record<
    VendorOrderItem['status'],
    { label: string; className: string }
  > = useMemo(() => ({
    delivered: { label: t('vendors.ordersLog.statusDelivered', 'Delivered'), className: 'bg-green-100 text-green-700' },
    canceled: { label: t('vendors.ordersLog.statusCanceled', 'Canceled'), className: 'bg-red-100 text-red-600' },
    shipped: { label: t('vendors.ordersLog.statusShipped', 'Shipped'), className: 'bg-amber-100 text-amber-700' },
  }), [t]);

  const allOrders: VendorOrderItem[] = useMemo(() => [], []);

  // ── Zustand: filter / pagination / selection state ────────────────────────
  const appliedFrom  = useVendorOrdersStore((s) => s.appliedFrom);
  const appliedTo    = useVendorOrdersStore((s) => s.appliedTo);
  const statusFilter = useVendorOrdersStore((s) => s.statusFilter);
  const search       = useVendorOrdersStore((s) => s.search);
  const page         = useVendorOrdersStore((s) => s.page);
  const selectedIds  = useVendorOrdersStore((s) => s.selectedIds);

  const setStatusFilter   = useVendorOrdersStore((s) => s.setStatusFilter);
  const setSearch         = useVendorOrdersStore((s) => s.setSearch);
  const setPage           = useVendorOrdersStore((s) => s.setPage);
  const applyFilter       = useVendorOrdersStore((s) => s.applyFilter);
  const resetStore        = useVendorOrdersStore((s) => s.reset);
  const toggleSelect      = useVendorOrdersStore((s) => s.toggleSelect);
  const toggleSelectAllFn = useVendorOrdersStore((s) => s.toggleSelectAll);

  // ── Local UI state ────────────────
  const [fromDate, setFromDate] = useState(appliedFrom);
  const [toDate,   setToDate]   = useState(appliedTo);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setIsLoading(true), 0);
    const endTimer = setTimeout(() => setIsLoading(false), 300);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [page, appliedFrom, appliedTo, statusFilter, search]);

  const filtered = useMemo(() => {
    return allOrders.filter((o) => {
      const oDate = new Date(o.date);

      if (appliedFrom) {
        const from = new Date(appliedFrom);
        from.setHours(0, 0, 0, 0);
        if (!isNaN(oDate.getTime()) && oDate < from) return false;
      }

      if (appliedTo) {
        const to = new Date(appliedTo);
        to.setHours(23, 59, 59, 999);
        if (!isNaN(oDate.getTime()) && oDate > to) return false;
      }

      if (statusFilter !== 'all' && o.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.vendorName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allOrders, appliedFrom, appliedTo, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const activeOrdersCount = filtered.filter((o) => o.status === 'shipped').length;

  const allSelected =
    paginated.length > 0 && paginated.every((o) => selectedIds.includes(o.id));

  const toggleSelectAll = () => toggleSelectAllFn(paginated.map((o) => o.id));

  const handleFilter = () => applyFilter(fromDate, toDate);

  const handleReset = () => {
    const DEFAULT_FROM = '2024-01-01';
    const DEFAULT_TO   = '2026-12-31';
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
    resetStore();
  };

  const displayOrdersCount = (vendor.orders ?? filtered.length) || 0;
  const displayRevenue = (vendor.revenue ?? totalRevenue) || 0;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 3 Stat Cards Row */}
      <motion.div
        variants={cardVariants}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.ordersLog.totalOrders', 'Total Orders')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {displayOrdersCount > 0 ? displayOrdersCount.toLocaleString('en-US') : '--'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.ordersLog.totalRevenue', 'Total Order Revenue')}</p>
          <p className="text-2xl font-bold text-green-600">
            {displayRevenue > 0 ? (
              <>
                {displayRevenue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-xs font-normal text-green-600">SAR</span>
              </>
            ) : (
              '--'
            )}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.ordersLog.shippedOrders', 'Shipped Orders')}</p>
          <p className="text-2xl font-bold text-amber-500">
            {activeOrdersCount > 0 ? activeOrdersCount : '--'}
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
            placeholder={t('vendors.ordersLog.searchPlaceholder', 'Order ID, Customer, Vendor...')}
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
            <option value="all">{t('vendors.ordersLog.allStatuses', 'All Statuses')}</option>
            <option value="delivered">{t('vendors.ordersLog.statusDelivered', 'Delivered')}</option>
            <option value="shipped">{t('vendors.ordersLog.statusShipped', 'Shipped')}</option>
            <option value="canceled">{t('vendors.ordersLog.statusCanceled', 'Canceled')}</option>
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

      {/* Orders Table */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-100">
                <th className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="accent-black w-4 h-4 cursor-pointer rounded"
                  />
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colOrderId', 'Order ID')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colCustomer', 'Customer')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colVendor', 'Vendor')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colTotal', 'Total (SAR)')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colStatus', 'Status')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colSubOrders', 'Sub-orders')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colDate', 'Date')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.ordersLog.colActions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="w-10 px-4 py-4 text-center">
                      <div className="w-4 h-4 rounded bg-gray-200 animate-pulse mx-auto" />
                    </td>
                    <td className="px-5 py-4"><div className="w-24 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-28 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-24 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-5 rounded-full bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-8 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-3.5 rounded bg-gray-200 animate-pulse" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-xs text-gray-400">
                    {t('vendors.ordersLog.noOrdersFound', 'No orders found for the applied filter.')}
                  </td>
                </tr>
              ) : (
                paginated.map((order) => {
                  const style = ORDER_STATUS_STYLES[order.status];
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <td className="w-10 px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="accent-black w-4 h-4 cursor-pointer rounded"
                        />
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {order.customer}
                      </td>
                      <td className="px-5 py-4 text-gray-400 font-medium">
                        {order.vendorName}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">
                        {order.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        SAR
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-medium ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {order.subOrders}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {order.date}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => navigate('/incoming-orders')}
                          className="font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          {t('vendors.ordersLog.viewDetails', 'View details')}
                        </button>
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
