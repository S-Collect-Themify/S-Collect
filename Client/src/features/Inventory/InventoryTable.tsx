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
    <div className="overflow-x-auto">
      <table className="w-full text-body-md table-fixed min-w-[750px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[18%]">
              {t(columns[0])}
            </th>
            <th className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[26%]">
              {t(columns[1])}
            </th>
            <th className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[24%]">
              {t(columns[2])}
            </th>
            <th className="text-center py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[12%] whitespace-nowrap">
              {t(columns[3])}
            </th>
            <th className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[10%] whitespace-nowrap">
              {t(columns[4])}
            </th>
            <th className="text-left rtl:text-right py-3 px-3 text-body-sm font-bold text-gray-950 tracking-wider w-[10%] whitespace-nowrap">
              {t(columns[5])}
            </th>
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
              <td className="py-3 px-3 text-body-md font-medium text-gray-900 truncate" title={product.name}>
                {product.name}
              </td>
              <td className="py-3 px-3 text-body-sm text-gray-400 truncate max-w-0" title={product.sku}>
                {product.sku}
              </td>
              <td className="py-3 px-3 text-body-md text-gray-500 truncate max-w-0" title={product.variant}>
                {product.variant}
              </td>
              <td className="py-3 px-3 text-center">
                <input
                  type="number"
                  min={0}
                  value={product.stock}
                  onChange={(e) => onStockChange(product.id, e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-body-md focus:outline-none focus:border-gray-600 bg-gray-50 transition-colors"
                />
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-body-sm font-medium whitespace-nowrap inline-block ${STATUS_STYLES[product.status]}`}
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
              <td className="py-3 px-3 text-body-sm text-gray-400 whitespace-nowrap">
                {product.updatedAt}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
