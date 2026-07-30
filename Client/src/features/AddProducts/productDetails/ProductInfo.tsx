import { useState } from 'react';
import { Star, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export interface ProductImageInfo {
  id?: string;
  url?: string;
  isThumbnail?: boolean;
}

export interface ProductInfoProps {
  images?: ProductImageInfo[];
  name?: string;
  description?: string;
  descriptionAr?: string;
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
  images = [],
  name,
  description,
  descriptionAr,
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const onEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  const isArabic = i18n.language === 'ar';
  const displayDescription = isArabic
    ? descriptionAr || description
    : description || descriptionAr;

  const safeImages = Array.isArray(images) ? images : [];
  const sortedImages = [...safeImages].sort(
    (a, b) => Number(Boolean(b?.isThumbnail)) - Number(Boolean(a?.isThumbnail))
  );
  const imageUrls = sortedImages
    .map((img) => img?.url)
    .filter((u): u is string => Boolean(u));

  const safeAvg = typeof averageRating === 'number' && !isNaN(averageRating) ? averageRating : 0;
  const safeTotal = typeof totalReviews === 'number' && !isNaN(totalReviews) ? totalReviews : 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const mainImage = imageUrls[activeIndex];

  return (
    <div className="w-full  rounded-2xl border border-gray-200 bg-white p-4 lg:p-6">
      <div className="flex gap-6 flex-col lg:flex-row ">
        {/* Image gallery: main image + thumbnails */}
        <div className="flex gap-3 flex-col-reverse md:flex-row">
          {/* Thumbnails column */}
          {imageUrls.length > 1 && (
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                    i === activeIndex
                      ? 'border-gray-900'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="lg:h-100 lg:w-100 shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {mainImage ? (
              <img
                src={mainImage}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
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

          {/* Description */}
          {displayDescription && (
            <div className="mt-4">
              <p className="mb-1 text-xs text-gray-400">
                {t('productDetails.productInfo.description', 'Description')}
              </p>
              <p
                dir={isArabic ? 'rtl' : 'ltr'}
                className="text-sm leading-relaxed text-gray-700"
              >
                {displayDescription}
              </p>
            </div>
          )}

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
                  {safeAvg.toFixed(1)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  {t('productDetails.productInfo.totalReviews')}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-gray-800">
                  {t('productDetails.productInfo.reviewsCount', {
                    count: safeTotal,
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
