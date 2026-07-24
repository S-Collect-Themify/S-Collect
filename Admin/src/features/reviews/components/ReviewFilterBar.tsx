import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReviewStore } from '../reviewStore';

interface ReviewFilterBarProps {
  availableVendors?: string[];
  availableProducts?: string[];
}

export const ReviewFilterBar = ({
  availableVendors = [],
  availableProducts = [],
}: ReviewFilterBarProps) => {
  const { t } = useTranslation();
  const search = useReviewStore((s) => s.search);
  const vendorFilter = useReviewStore((s) => s.vendorFilter);
  const ratingFilter = useReviewStore((s) => s.ratingFilter);
  const productFilter = useReviewStore((s) => s.productFilter);

  const setSearch = useReviewStore((s) => s.setSearch);
  const setVendorFilter = useReviewStore((s) => s.setVendorFilter);
  const setRatingFilter = useReviewStore((s) => s.setRatingFilter);
  const setProductFilter = useReviewStore((s) => s.setProductFilter);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:left-auto rtl:right-3.5"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('reviewsListing.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all rtl:pl-4 rtl:pr-10"
        />
      </div>

      {/* 3 Dropdown Filters (Grid on mobile, flex on desktop) */}
      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
        {/* Vendor Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all" className="hidden sm:inline">
              {t('reviewsListing.allVendors')}
            </option>
            <option value="all" className="sm:hidden">
              {t('reviewsListing.vendorMobile')}
            </option>
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

        {/* Rating Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all" className="hidden sm:inline">
              {t('reviewsListing.allRatings')}
            </option>
            <option value="all" className="sm:hidden">
              {t('reviewsListing.ratingMobile')}
            </option>
            <option value="5">5 ★★★★★</option>
            <option value="4">4 ★★★★☆</option>
            <option value="3">3 ★★★☆☆</option>
            <option value="2">2 ★★☆☆☆</option>
            <option value="1">1 ★☆☆☆☆</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rtl:right-auto rtl:left-2 sm:rtl:left-3"
          />
        </div>

        {/* Product Dropdown */}
        <div className="relative w-full sm:w-auto sm:inline-block">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 pr-7 sm:pr-9 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-7 sm:rtl:pl-9 rtl:pr-3 sm:rtl:pr-4 truncate"
          >
            <option value="all" className="hidden sm:inline">
              {t('reviewsListing.allProducts')}
            </option>
            <option value="all" className="sm:hidden">
              {t('reviewsListing.productMobile')}
            </option>
            {availableProducts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
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
