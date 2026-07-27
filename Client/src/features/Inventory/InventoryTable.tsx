// features/Inventory/InventoryTable.tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { STATUS_STYLES, type ProductRow } from './types';

interface InventoryTableProps {
  data: ProductRow[];
  onStockChange: (id: string, value: string) => void;
}

export const InventoryTable = ({
  data,
  onStockChange,
}: InventoryTableProps) => {
  const { t } = useTranslation();

  const columns = [
    'inventoryPage.colProductName',
    'inventoryPage.colSku',
    'inventoryPage.colVariant',
    'inventoryPage.colCurrentStock',
    'inventoryPage.colStatus',
    'inventoryPage.colLastUpdated',
  ];

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 text-gray-400"
      >
        {t('inventoryPage.noProducts')}
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full text-body-md">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 uppercase tracking-wider"
              >
                {t(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="border-b border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <td className="py-3 px-3 text-body-md font-medium text-gray-900">
                {product.name}
              </td>
              <td className="py-3 px-3 text-body-sm text-gray-400">
                {product.sku}
              </td>
              <td className="py-3 px-3 text-body-md text-gray-500">
                {product.variant}
              </td>
              <td className="py-3 px-3">
                <input
                  type="number"
                  min={0}
                  value={product.stock}
                  onChange={(e) => onStockChange(product.id, e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-body-md focus:outline-none focus:border-gray-600 bg-gray-50 transition-colors"
                />
              </td>
              <td className="py-3 px-3">
                <span
                  className={`px-3 py-1 rounded-full text-body-sm  font-medium ${STATUS_STYLES[product.status]}`}
                >
                  {t(
                    `inventoryPage.${
                      product.status === 'In Stock'
                        ? 'inStock'
                        : product.status === 'Low Stock'
                          ? 'lowStock'
                          : 'outOfStock'
                    }`
                  )}
                </span>
              </td>
              <td className="py-3 px-3 text-body-sm text-gray-400">
                {product.updatedAt}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
