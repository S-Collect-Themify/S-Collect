import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useVendorProductsStore } from '../../../store/vendorProductsStore';
import type { Vendor } from '../types/vendors';

const ITEMS_PER_PAGE = 5;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

export interface VendorProductItem {
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
  date: string;
}

interface VendorProductsLogProps {
  vendor: Vendor;
}

export default function VendorProductsLog({ vendor }: VendorProductsLogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const allProducts: VendorProductItem[] = useMemo(
    () => [
      { name: 'Premium Cotton T-Shirt', category: 'Apparel', price: 120, status: 'active', date: 'Oct 24, 2026' },
      { name: 'Minimalist Sneakers', category: 'Footwear', price: 450, status: 'active', date: 'Oct 22, 2026' },
      { name: 'Denim Jacket', category: 'Apparel', price: 380, status: 'inactive', date: 'Oct 20, 2026' },
      { name: 'Casual Hoodie', category: 'Apparel', price: 210, status: 'active', date: 'Oct 18, 2026' },
      { name: 'Leather Wallet', category: 'Accessories', price: 150, status: 'active', date: 'Oct 15, 2026' },
      { name: 'Classic Sunglasses', category: 'Accessories', price: 290, status: 'active', date: 'Oct 12, 2026' },
      { name: 'Running Shoes', category: 'Footwear', price: 520, status: 'inactive', date: 'Oct 10, 2026' },
    ],
    []
  );

  // ── Zustand state ──
  const appliedFrom  = useVendorProductsStore((s) => s.appliedFrom);
  const appliedTo    = useVendorProductsStore((s) => s.appliedTo);
  const statusFilter = useVendorProductsStore((s) => s.statusFilter);
  const search       = useVendorProductsStore((s) => s.search);
  const page         = useVendorProductsStore((s) => s.page);

  const setStatusFilter = useVendorProductsStore((s) => s.setStatusFilter);
  const setSearch       = useVendorProductsStore((s) => s.setSearch);
  const setPage         = useVendorProductsStore((s) => s.setPage);
  const applyFilter     = useVendorProductsStore((s) => s.applyFilter);
  const resetStore      = useVendorProductsStore((s) => s.reset);

  const [fromDate, setFromDate] = useState(appliedFrom);
  const [toDate,   setToDate]   = useState(appliedTo);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [page, appliedFrom, appliedTo, statusFilter, search]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
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

      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [allProducts, appliedFrom, appliedTo, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const activeProductsCount = filtered.filter((p) => p.status === 'active').length;
  const inactiveProductsCount = filtered.filter((p) => p.status === 'inactive').length;

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
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.productsLog.totalProducts', 'Total Products')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {(vendor.products ?? filtered.length).toLocaleString('en-US')}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.productsLog.activeProducts', 'Active Products')}</p>
          <p className="text-2xl font-bold text-green-600">
            {activeProductsCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">{t('vendors.productsLog.inactiveProducts', 'Inactive / Out of Stock')}</p>
          <p className="text-2xl font-bold text-amber-500">
            {inactiveProductsCount}
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
            placeholder={t('vendors.productsLog.searchPlaceholder', 'Product Name or Category...')}
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
            <option value="all">{t('vendors.productsLog.allStatuses', 'All Statuses')}</option>
            <option value="active">{t('vendors.table.active', 'Active')}</option>
            <option value="inactive">{t('vendors.table.inactive', 'Inactive')}</option>
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

      {/* Products Table */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-100">
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.productsLog.colName', 'Product Name')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.productsLog.colCategory', 'Category')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.productsLog.colPrice', 'Price (SAR)')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.productsLog.colStatus', 'Status')}
                </th>
                <th className="px-5 py-3.5 text-start font-semibold text-gray-800">
                  {t('vendors.productsLog.colDate', 'Date Added')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-5 py-4"><div className="w-32 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-16 h-4 rounded bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-14 h-5 rounded-full bg-gray-200 animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="w-20 h-3.5 rounded bg-gray-100 animate-pulse" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-gray-400">
                    {t('vendors.productsLog.noProductsFound', 'No products found for the applied filter.')}
                  </td>
                </tr>
              ) : (
                paginated.map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {product.category}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {product.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      SAR
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {product.status === 'active'
                          ? t('vendors.table.active', 'Active')
                          : t('vendors.table.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {product.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
