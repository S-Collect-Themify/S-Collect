import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { InventoryAlertItem } from './types';

const InventoryCard = ({ cardData }: { cardData: InventoryAlertItem }) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: InventoryAlertItem['status']) => {
    switch (status) {
      case 'Out of Stock':
        return t('inventoryItem.outOfStock');
      case 'Low Stock':
        return t('inventoryItem.lowStock');
      case 'In Stock':
        return t('inventoryItem.inStock');
      default:
        return status;
    }
  };

  const productLink = `/product-details/${cardData.productId}`;

  return (
    <Link
      to={productLink}
      className="flex items-center gap-3 shadow p-2 lg:p-3 rounded-lg bg-white w-full overflow-hidden hover:bg-gray-50 transition-colors block cursor-pointer group"
    >
      <div className="lg:h-14 lg:w-14 h-10 w-10 rounded-lg overflow-hidden shrink-0 aspect-square">
        <img
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
          src={cardData.image}
          alt={cardData.name}
        />
      </div>
      <div className="flex flex-col gap-1 lg:gap-2 flex-1 min-w-0">
        <h6 className="text-xs line-clamp-1 lg:text-base font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
          {cardData.name}
        </h6>
        <p className="text-xs lg:text-sm text-gray-400 truncate">
          {t('inventoryItem.sku')} : {cardData.sku}
          <span className="text-gray-400 lg:hidden">
            {' • '}
            {t('inventoryItem.stock')} : {cardData.stockCount}
          </span>
        </p>
      </div>
      <div className="flex flex-col items-end pe-1.5 shrink-0">
        <span
          className="px-[5px] py-0.5 rounded-[2px] inline-block text-[10px] lg:text-xs whitespace-nowrap"
          style={{
            background: cardData.theme.background,
            color: cardData.theme.text,
          }}
        >
          {getStatusLabel(cardData.status)}
        </span>
        <span className="text-gray-400 text-xs hidden lg:block whitespace-nowrap mt-1">
          {t('inventoryItem.stock')} : {cardData.stockCount}
        </span>
      </div>
    </Link>
  );
};

export default InventoryCard;
