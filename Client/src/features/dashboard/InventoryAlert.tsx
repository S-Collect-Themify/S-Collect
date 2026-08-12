import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import InventoryCard from './InventoryCard';
import InventoryAlertSkeleton from './skeleton/InventoryAlertSkeleton';
import { useInventoryAlerts } from './hooks/useInventoryAlerts';
import { containerVariants, itemVariants } from '../../utils/animations';

const InventoryAlert = () => {
  const { t } = useTranslation();
  const { alertItems, lowOrNoStockCount, isLoading } = useInventoryAlerts();

  if (isLoading) {
    return <InventoryAlertSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full rounded-lg bg-white p-3 lg:p-8 shadow h-112.5 lg:h-128"
    >
      <motion.div
        variants={itemVariants}
        className="flex gap-2 items-center mb-3 lg:mb-6"
      >
        <TriangleAlert className="text-yellow w-4 h-4 lg:w-6 lg:h-6" />
        <h3 className="text-sm lg:text-xl font-bold">{t('inventoryAlerts')}</h3>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-yellow-light text-yellow px-4 py-2.5 rounded-lg text-sm mb-6 hidden lg:block"
      >
        <p>
          {lowOrNoStockCount > 0
            ? `${lowOrNoStockCount} ${t('inventoryItem.alertMessage', 'products are running low on stock.')}`
            : t(
                'inventoryItem.allStockGood',
                'All inventory stock levels look good.'
              )}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="mb-6 flex flex-col gap-3 h-[60%] overflow-y-auto pr-1"
      >
        {alertItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No inventory items found.
          </div>
        ) : (
          alertItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <InventoryCard cardData={item} />
            </motion.div>
          ))
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link
          to={'/inventory'}
          className="w-full text-center rounded-lg border block py-1.5 lg:py-3 mt-auto hover:bg-gray-50 transition-colors"
        >
          {t('inventoryItem.manageInventory')}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default InventoryAlert;
