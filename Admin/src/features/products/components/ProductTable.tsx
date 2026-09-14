import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import Toggle from '../../../components/ui/Toggle';
import type { ProductItem } from '../types';
import { useProductStore } from '../productStore';

interface ProductTableProps {
  products: ProductItem[];
  onToggleStatus: (product: ProductItem) => void;
}

const BROKEN_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23F9FAFB' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/><line x1='2' x2='22' y1='2' y2='22'/><circle cx='9' cy='9' r='2'/></svg>";

export const ProductTable = ({ products, onToggleStatus }: ProductTableProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const selectedProductIds = useProductStore((s) => s.selectedProductIds);
  const toggleSelectProduct = useProductStore((s) => s.toggleSelectProduct);
  const selectAllProducts = useProductStore((s) => s.selectAllProducts);

  const currentIds = products.map((p) => p.id);
  const isAllSelected = currentIds.length > 0 && currentIds.every((id) => selectedProductIds.includes(id));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse rtl:text-right">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/30 text-sm font-semibold text-gray-800">
            <th className="py-4 px-4 w-10 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => selectAllProducts(currentIds)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                title={isAr ? 'تحديد الكل' : 'Select All'}
              />
            </th>
            <th className="py-4 px-6">{t('productsListing.table.productName')}</th>
            <th className="py-4 px-6">{t('productsListing.table.vendor')}</th>
            <th className="py-4 px-6">{t('productsListing.table.category')}</th>
            <th className="py-4 px-6">{t('productsListing.table.price')}</th>
            <th className="py-4 px-6">{t('productsListing.table.stock')}</th>
            <th className="py-4 px-6">{t('productsListing.table.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {products.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);

            return (
              <tr
                key={product.id}
                className={`hover:bg-gray-50/60 transition-colors ${
                  isSelected ? 'bg-gray-50/80' : ''
                }`}
              >
                {/* Select Checkbox */}
                <td className="py-4 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
                  />
                </td>

                {/* Product Name & Image */}
                <td className="py-4 px-6">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex items-center gap-3.5 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 group-hover:opacity-90 transition-opacity">
                      <img
                        src={product.image || BROKEN_IMAGE_FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = BROKEN_IMAGE_FALLBACK;
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 group-hover:text-black group-hover:underline transition-colors">
                        {isAr && product.nameAr ? product.nameAr : product.name}
                      </span>
                      {!!product.discountPercent && product.discountPercent > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs shrink-0">
                          <Tag size={11} className="rotate-90" />
                          <span>{isAr ? `%${product.discountPercent}-` : `-${product.discountPercent}%`}</span>
                        </span>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Vendor */}
                <td className="py-4 px-6 text-gray-700">{product.vendor}</td>

                {/* Category */}
                <td className="py-4 px-6 text-gray-700">
                  {isAr && product.categoryAr ? product.categoryAr : product.category}
                </td>

                {/* Price */}
                <td className="py-4 px-6 font-medium text-gray-900">
                  {product.price.toLocaleString()}
                </td>

                {/* Stock */}
                <td className="py-4 px-6">
                  <span className="text-gray-700 font-medium">
                    {product.totalStock}
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
            );
          })}

          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                {t('productsListing.emptyState')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
