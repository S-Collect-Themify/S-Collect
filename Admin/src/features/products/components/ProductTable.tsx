import { useTranslation } from 'react-i18next';
import Toggle from '../../categories/components/Toggle';
import type { ProductItem } from '../types';

interface ProductTableProps {
  products: ProductItem[];
  onToggleStatus: (product: ProductItem) => void;
}

export const ProductTable = ({ products, onToggleStatus }: ProductTableProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse rtl:text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-800">
            <th className="py-4 px-6">{t('productsListing.table.productName')}</th>
            <th className="py-4 px-6">{t('productsListing.table.vendor')}</th>
            <th className="py-4 px-6">{t('productsListing.table.category')}</th>
            <th className="py-4 px-6">{t('productsListing.table.price')}</th>
            <th className="py-4 px-6">{t('productsListing.table.stock')}</th>
            <th className="py-4 px-6">{t('productsListing.table.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50/60 transition-colors"
            >
              {/* Product Name & Image */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
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
                  <span className="font-semibold text-gray-900">
                    {isAr && product.nameAr ? product.nameAr : product.name}
                  </span>
                </div>
              </td>

              {/* Vendor */}
              <td className="py-4 px-6 text-gray-700">{product.vendor}</td>

              {/* Category */}
              <td className="py-4 px-6 text-gray-700">{product.category}</td>

              {/* Price */}
              <td className="py-4 px-6 font-medium text-gray-900">
                {product.price.toLocaleString()}
              </td>

              {/* Stock */}
              <td className="py-4 px-6">
                <span
                  className={
                    product.stock === 0
                      ? 'text-red-500 font-semibold'
                      : 'text-gray-900 font-medium'
                  }
                >
                  {product.stock}
                </span>
              </td>

              {/* Status Switch */}
              <td className="py-4 px-6">
                <Toggle
                  checked={product.isActive}
                  onChange={() => onToggleStatus(product)}
                />
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                {t('productsListing.emptyState')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
