// features/Inventory/mobile/ProductCard.tsx
import { useTranslation } from 'react-i18next';
import { type ProductRow, STATUS_STYLES } from '../types';

interface ProductCardProps {
  product: ProductRow;
  onStockChange: (id: string, value: string) => void;
}

export const ProductCard = ({ product, onStockChange }: ProductCardProps) => {
  const { t } = useTranslation();

  const statusLabel =
    product.status === 'In Stock'
      ? t('inventoryPage.inStock')
      : product.status === 'Low Stock'
        ? t('inventoryPage.lowStock')
        : t('inventoryPage.outOfStock');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      {/* Top row: name + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h6 className="font-semibold text-gray-900 text-sm leading-tight truncate" title={product.name}>
            {product.name}
          </h6>
          <p className="text-xs text-gray-400 mt-0.5 truncate" title={`${product.sku} • ${product.variant}`}>
            <span>{product.sku}</span>
            {product.variant ? ` • ${product.variant}` : ''}
          </p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[product.status]}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Bottom row: stock input + last updated */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            {t('inventoryPage.colCurrentStock', 'Stock')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 leading-none w-10">
              {product.stock}
            </span>
            <input
              type="number"
              min={0}
              value={product.stock}
              onChange={(e) => onStockChange(product.id, e.target.value)}
              className="w-16 text-center border border-gray-200 rounded-xl py-1.5 text-sm font-medium focus:outline-none focus:border-gray-700 bg-gray-50 transition-colors"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 text-right whitespace-nowrap">
          {t('inventoryPage.updated', 'Updated')} {product.updatedAt}
        </p>
      </div>
    </div>
  );
};
