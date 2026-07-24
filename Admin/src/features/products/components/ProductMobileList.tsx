import { useTranslation } from 'react-i18next';
import Toggle from '../../categories/components/Toggle';
import type { ProductItem } from '../types';

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

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          {/* Top Section: Image + Title & Vendor/Category */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
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
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {isAr && product.nameAr ? product.nameAr : product.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 truncate">
                {product.vendor} · {product.category}
              </p>
            </div>
          </div>

          {/* Bottom Section: Price, Stock, and Status Toggle */}
          <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            {/* Price */}
            <div>
              <span className="block text-gray-400 text-[11px]">
                {t('productsListing.mobile.price')}
              </span>
              <span className="font-semibold text-gray-900 text-sm">
                {product.price.toLocaleString()} SAR
              </span>
            </div>

            {/* Stock */}
            <div>
              <span className="block text-gray-400 text-[11px]">
                {t('productsListing.mobile.stock')}
              </span>
              <span
                className={`font-semibold text-sm ${
                  product.stock === 0 ? 'text-red-500' : 'text-gray-900'
                }`}
              >
                {product.stock}
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
      ))}

      {products.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 text-sm">
          {t('productsListing.emptyState')}
        </div>
      )}
    </div>
  );
};
