import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../productStore';
import type { StatusFilter } from '../types';

interface ProductFilterBarProps {
  availableVendors?: string[];
  availableCategories?: string[];
}

export const ProductFilterBar = ({
  availableVendors = [],
  availableCategories = [],
}: ProductFilterBarProps) => {
  const { t } = useTranslation();
  const search = useProductStore((s) => s.search);
  const vendorFilter = useProductStore((s) => s.vendorFilter);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  const statusFilter = useProductStore((s) => s.statusFilter);

  const setSearch = useProductStore((s) => s.setSearch);
  const setVendorFilter = useProductStore((s) => s.setVendorFilter);
  const setCategoryFilter = useProductStore((s) => s.setCategoryFilter);
  const setStatusFilter = useProductStore((s) => s.setStatusFilter);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-sm">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:left-auto rtl:right-3.5"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('productsListing.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all rtl:pl-4 rtl:pr-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
        {/* Vendor Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all">{t('productsListing.vendor')}</option>
            {availableVendors.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all">{t('productsListing.category')}</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all">{t('productsListing.status')}</option>
            <option value="active">{t('productsListing.active')}</option>
            <option value="disabled">{t('productsListing.disabled')}</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
          />
        </div>
      </div>
    </div>
  );
};
