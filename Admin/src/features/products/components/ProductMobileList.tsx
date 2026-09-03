import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import Toggle from '../../../components/ui/Toggle';
import type { ProductItem } from '../types';
import { useProductStore } from '../productStore';

interface ProductMobileListProps {
  products: ProductItem[];
  onToggleStatus: (product: ProductItem) => void;
}

const BROKEN_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23F9FAFB' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/><line x1='2' x2='22' y1='2' y2='22'/><circle cx='9' cy='9' r='2'/></svg>";

export const ProductMobileList = ({
  products,
  onToggleStatus,
}: ProductMobileListProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const selectedProductIds = useProductStore((s) => s.selectedProductIds);
  const toggleSelectProduct = useProductStore((s) => s.toggleSelectProduct);
  const selectAllProducts = useProductStore((s) => s.selectAllProducts);

  const currentIds = products.map((p) => p.id);
  const isAllSelected = currentIds.length > 0 && currentIds.every((id) => selectedProductIds.includes(id));

  return (
    <div className="space-y-3">
      {/* Select All Mobile Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={() => selectAllProducts(currentIds)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
          />
          <span>{isAr ? 'تحديد الكل' : 'Select All'}</span>
        </label>
        <span className="text-[11px] text-gray-400 font-medium">
          {selectedProductIds.length} {t('common.selected', { defaultValue: 'selected' })}
        </span>
      </div>

      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);

        return (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3 transition-colors ${
              isSelected ? 'bg-gray-50/80 border-gray-200' : ''
            }`}
          >
            {/* Top Row: Checkbox + Thumbnail + Name */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectProduct(product.id)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black mt-1 shrink-0"
              />
              <Link
                to={`/products/${product.id}`}
                className="flex items-start gap-3 flex-1 min-w-0 group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 group-hover:opacity-90 transition-opacity">
                  <img
                    src={product.image || BROKEN_IMAGE_FALLBACK}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = BROKEN_IMAGE_FALLBACK;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-black group-hover:underline transition-colors">
                      {isAr && product.nameAr ? product.nameAr : product.name}
                    </h3>
                    {!!product.discountPercent && product.discountPercent > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                        <Tag size={10} className="rotate-90" />
                        <span>{isAr ? `%${product.discountPercent}-` : `-${product.discountPercent}%`}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {product.vendor} · {isAr && product.categoryAr ? product.categoryAr : product.category}
                  </p>
                </div>
              </Link>
            </div>

            {/* Bottom Section: Price, Stock, and Status Toggle */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              {/* Price */}
              <div>
                <span className="block text-gray-400 text-[11px]">
                  {t('productsListing.mobile.price')}
                </span>
                <span className="font-semibold text-gray-900 text-sm">
                  {product.price.toLocaleString()} {isAr ? '﷼' : 'SAR'}
                </span>
              </div>

              {/* Stock */}
              <div>
                <span className="block text-gray-400 text-[11px]">
                  {t('productsListing.mobile.stock')}
                </span>
                <span className="font-semibold text-sm text-gray-700">
                  {product.totalStock}
                </span>
              </div>

              {/* Status Switch */}
              <div className="flex items-center">
                <Toggle
                  checked={product.isActive}
                  onChange={() => onToggleStatus(product)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 text-sm">
          {t('productsListing.emptyState')}
        </div>
      )}
    </div>
  );
};
