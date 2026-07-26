import { Star, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export interface ProductInfoProps {
  imageUrl?: string;
  name?: string;
  category?: string;
  brand?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  currency?: string;
  inStock?: boolean;
  stockCount?: number;
  averageRating?: number;
  totalReviews?: number;
  onEdit?: () => void;
}

export default function ProductInfo({
  imageUrl,
  name,
  category,
  brand,
  sku,
  price,
  compareAtPrice,
  cost,
  currency = 'SAR',
  inStock,
  stockCount,
  averageRating = 0,
  totalReviews,
}: ProductInfoProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const onEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  return (
    <div className="w-full  rounded-2xl border border-gray-200 bg-white p-4 lg:p-6">
      <div className="flex gap-6 flex-col lg:flex-row ">
        {/* Image */}
        <div className="h-70 w-full lg:h-100 lg:w-100 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between pb-2">
            <h2 className="text-lg font-semibold text-gray-900 lg:text-2xl ">
              {name}
            </h2>
            <button
              type="button"
              onClick={onEdit}
              aria-label={t('productDetails.productInfo.editProduct')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="mt-1 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap">
            <div className="flex gap-0.5 sm:flex-row sm:gap-2">
              <span className="text-gray-400 ">
                {t('productDetails.productInfo.category')}
              </span>
              <span className="font-bold text-gray-700 ">{category}</span>
            </div>
            <div className="flex gap-0.5 sm:flex-row sm:gap-2">
              <span className="text-gray-400 ">
                {t('productDetails.productInfo.brand')}
              </span>
              <span className="font-bold text-gray-700 ">{brand}</span>
            </div>
            <div className="flex gap-0.5 sm:flex-row sm:gap-2">
              <span className="text-gray-400 ">
                {t('productDetails.productInfo.sku')}
              </span>
              <span className="font-bold text-gray-700">{sku}</span>
            </div>
          </div>

          <div className="my-3 lg:my-6 flex flex-col  gap-2 sm:flex-row items-center sm:gap-2">
            <div className="flex items-center gap-2 ">
              <span className="text-[28px] font-bold text-gray-900">
                {price} {currency}
              </span>
              {compareAtPrice != null && (
                <span className="text-sm text-gray-400 line-through">
                  {compareAtPrice} {currency}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 sm:ml-2">
                {t('productDetails.productInfo.cost')}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {cost} {currency}
              </span>
            </div>
          </div>

          <hr className="mb-6 border-gray-100" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-16">
            <div>
              <p className="text-xs text-gray-400">
                {t('productDetails.productInfo.inventory')}
              </p>
              <p className="mt-1">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    inStock
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {inStock
                    ? `${t('productDetails.productInfo.inStock')} (${stockCount} ${t('productDetails.productInfo.units')})`
                    : `${t('productDetails.productInfo.outOfStock')} (${stockCount} ${t('productDetails.productInfo.units')})`}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 ">
              <div>
                <p className="text-xs text-gray-400">
                  {t('productDetails.productInfo.averageRating')}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-sm font-semibold text-gray-800">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  {averageRating.toFixed(1)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  {t('productDetails.productInfo.totalReviews')}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-gray-800">
                  {t('productDetails.productInfo.reviewsCount', {
                    count: totalReviews,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
