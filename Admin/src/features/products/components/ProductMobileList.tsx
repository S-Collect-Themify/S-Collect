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

export const ProductMobileList = ({
  products,
  onToggleStatus,
}: ProductMobileListProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const selectedProductIds = useProductStore((s) => s.selectedProductIds);
  const toggleSelectProduct = useProductStore((s) => s.toggleSelectProduct);

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);

        return (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm transition-all ${
              isSelected ? 'ring-2 ring-black/10 bg-gray-50/50' : ''
            }`}
          >
            {/* Top Section: Checkbox + Image + Title & Vendor/Category */}
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
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150';
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
                  {product.stock !== undefined && product.stock !== null && product.stock !== ''
                    ? product.stock
                    : '-'}
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
