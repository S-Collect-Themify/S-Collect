import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SingleProductVariant } from '../../../services/products';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

export interface ProductVariantsTableProps {
  variants: SingleProductVariant[];
  isLoading?: boolean;
  currency?: string;
}

const PAGE_SIZE = 20;

export const ProductVariantsTable: React.FC<ProductVariantsTableProps> = ({
  variants = [],
  isLoading = false,
  currency = 'SAR',
}) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const currencySymbol = isAr ? '﷼' : (currency || 'SAR');
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = variants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

  const currentVariants = useMemo(() => {
    return variants.slice(startIndex, endIndex);
  }, [variants, startIndex, endIndex]);

  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
        <div className="h-5 bg-gray-200 rounded-md w-40 animate-pulse" />
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-left text-xs border-collapse rtl:text-right">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">{isAr ? 'الخيارات' : 'Options'}</th>
                <th className="py-3 px-4">{isAr ? 'السعر' : 'Price'}</th>
                <th className="py-3 px-4">{isAr ? 'المخزون' : 'Stock'}</th>
                <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="py-3.5 px-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-gray-900">
          {isAr ? 'خيارات المنتج والأنواع (Variants)' : 'Product Variants'} ({totalItems})
        </h3>
        {totalItems > 0 && (
          <span className="text-xs text-gray-500 font-medium">
            {isAr
              ? `عرض ${startIndex + 1}-${endIndex} من أصل ${totalItems}`
              : `Showing ${startIndex + 1}–${endIndex} of ${totalItems} variants`}
          </span>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-center text-xs text-gray-400 font-medium">
          {isAr ? 'لا توجد خيارات متاحة لهذا المنتج' : 'No variants available for this product'}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse rtl:text-right">
              <thead className="bg-gray-50/90 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">{isAr ? 'الخيارات' : 'Options'}</th>
                  <th className="py-3 px-4">{isAr ? 'السعر' : 'Price'}</th>
                  <th className="py-3 px-4">{isAr ? 'المخزون' : 'Stock'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentVariants.map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{startIndex + idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-800">{v.sku || '-'}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {v.optionValues && v.optionValues.length > 0
                        ? v.optionValues
                            .map((ov) => `${isAr && ov.optionNameAr ? ov.optionNameAr : ov.optionName}: ${isAr && ov.valueAr ? ov.valueAr : ov.value}`)
                            .join(' / ')
                        : '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {v.price.toLocaleString()} {currencySymbol}
                      {v.compareAtPrice && v.compareAtPrice > v.price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1.5 rtl:mr-1.5 font-normal">
                          {v.compareAtPrice.toLocaleString()} {currencySymbol}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          v.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                      >
                        {v.stock} {isAr ? 'وحدة' : 'units'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {v.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-gray-500 font-medium">
                {isAr ? `صفحة ${currentPage} من أصل ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </button>

                {getPaginationRange({ currentPage, totalPages }).map((pageItem, idx) => {
                  if (pageItem === DOTS) {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="size-7 flex items-center justify-center text-xs text-gray-400 select-none tracking-widest"
                      >
                        &#8230;
                      </span>
                    );
                  }

                  const pageNum = Number(pageItem);
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-black text-white shadow-2xs'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {isAr ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ProductVariantsTable;
