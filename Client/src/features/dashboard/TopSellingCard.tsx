import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type ProductSale = {
  id: string;
  name: string;
  imageUrl: string;
  unitsSold: number;
  revenue: number;
  currency: string;
  percentage: number;
};

const TopSellingCard = ({ cardData }: { cardData: ProductSale }) => {
  const { t } = useTranslation();
  const productLink = `/product-details/${cardData.id}`;


  return (
    <div className="flex items-center gap-2 rounded-xl bg-white p-3 w-full overflow-hidden hover:bg-gray-50 transition-colors">
      {/* Product Image Link */}
      <Link
        to={productLink}
        className="h-10 w-10 xl:h-14 xl:w-14 rounded-lg overflow-hidden shrink-0 block hover:opacity-90 transition-opacity"
      >
        <img
          className="object-cover w-full h-full"
          src={cardData.imageUrl}
          alt={cardData.name}
        />
      </Link>

      {/* Product Info Link */}
      <div className="flex-1 min-w-0">
        <Link to={productLink} className="block group">
          <h6 className="text-xs lg:text-sm xl:text-base font-medium text-gray-900 mb-2 truncate group-hover:text-amber-700 transition-colors">
            {cardData.name}
          </h6>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs xl:text-sm text-gray-500 whitespace-nowrap">
            {cardData.unitsSold} {t('dashboardMetrics.unit.product')}
          </span>

          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-700 rounded-full transition-all"
              style={{
                width: `${Math.min(cardData.percentage * 5, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-body-md font-bold text-green-600 whitespace-nowrap">
          {cardData.revenue.toLocaleString()} {cardData.currency}
        </span>

        <span className="text-xs xl:text-sm text-gray-400 mt-1">
          {cardData.percentage}%
        </span>
      </div>
    </div>
  );
};

export default TopSellingCard;
