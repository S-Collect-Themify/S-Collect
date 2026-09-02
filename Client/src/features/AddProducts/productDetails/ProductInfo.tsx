import { useState, useEffect } from 'react';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, FreeMode } from 'swiper/modules';
import { useDeleteProduct } from '../../mangement/useManagementHooks';
import { showDeleteConfirmation } from '../../mangement/deleteConfirmation';

import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

import type { ProductOption, ProductVariant } from '../types';

export interface ProductImageInfo {
  id?: string;
  url?: string;
  isThumbnail?: boolean;
}

interface VariantOptionValue {
  optionId?: string;
  optionName?: string;
  optionNameAr?: string;
  valueId?: string;
  value?: string;
  valueAr?: string;
}

export interface ProductInfoProps {
  id?: string;
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
  options?: ProductOption[];
  variants?: ProductVariant[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductInfo({
  id: propId,
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
  options = [],
  variants = [],
  onEdit,
  onDelete,
}: ProductInfoProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const routeParams = useParams<{ id: string }>();
  const deleteMutation = useDeleteProduct();

  const productId = propId || routeParams.id || '';

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else if (productId) {
      navigate(`/edit-product/${productId}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      return;
    }
    if (!productId) return;
    showDeleteConfirmation(
      'managementTable.deleteConfirmMessage',
      { name: name || 'Product' },
      () => {
        deleteMutation.mutate(productId, {
          onSuccess: () => {
            navigate('/management');
          },
        });
      },
      {
        titleKey: 'managementTable.deleteConfirmTitle',
        confirmKey: 'managementTable.delete',
        confirmClassName: 'bg-red-600 hover:bg-red-700',
        iconVariant: 'delete',
      }
    );
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

  const safeAvg =
    typeof averageRating === 'number' && !isNaN(averageRating)
      ? averageRating
      : 0;
  const safeTotal =
    typeof totalReviews === 'number' && !isNaN(totalReviews) ? totalReviews : 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    if (mainSwiper && !mainSwiper.destroyed) {
      mainSwiper.slideTo(index);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 lg:p-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Swiper Image Gallery */}
        <div className="w-full lg:w-120 shrink-0">
          {imageUrls.length > 0 ? (
            <div className="flex flex-col-reverse lg:flex-row gap-3">
              {/* Thumbnails Swiper (Horizontal on mobile under main image, Vertical on desktop) */}
              {imageUrls.length > 1 && (
                <div className="w-full lg:w-20 h-16 sm:h-20 lg:h-96 shrink-0">
                  <Swiper
                    key={isDesktop ? 'desktop-thumbs' : 'mobile-thumbs'}
                    onSwiper={setThumbsSwiper}
                    direction={isDesktop ? 'vertical' : 'horizontal'}
                    modules={[FreeMode, Thumbs]}
                    slidesPerView={isDesktop ? 4 : 'auto'}
                    spaceBetween={10}
                    freeMode
                    watchSlidesProgress
                    className="h-full w-full"
                  >
                    {imageUrls.map((url, i) => (
                      <SwiperSlide
                        key={i}
                        className="h-16! w-16! sm:h-20! sm:w-20! lg:w-full! lg:h-20!"
                      >
                        <button
                          type="button"
                          onClick={() => handleThumbnailClick(i)}
                          className={`h-full w-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${i === activeIndex
                              ? 'border-gray-900 ring-2 ring-gray-900/30 opacity-100 shadow-sm scale-[0.98]'
                              : 'border-transparent opacity-50 hover:opacity-85'
                            }`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Main Swiper (No arrows, No dots) */}
              <div className="flex-1 min-w-0">
                <Swiper
                  onSwiper={setMainSwiper}
                  modules={[Thumbs, FreeMode]}
                  navigation={false}
                  pagination={false}
                  onSlideChange={(swiper) => {
                    setActiveIndex(swiper.activeIndex);
                    if (thumbsSwiper && !thumbsSwiper.destroyed) {
                      thumbsSwiper.slideTo(swiper.activeIndex);
                    }
                  }}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  className="rounded-xl overflow-hidden bg-gray-100 h-72 sm:h-80 lg:h-96 w-full"
                >
                  {imageUrls.map((url, i) => (
                    <SwiperSlide key={i} className="flex items-center justify-center">
                      <img
                        src={url}
                        alt={name || ''}
                        className="h-full w-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          ) : (
            <div className="h-72 sm:h-80 lg:h-96 w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
              <svg
                className="h-12 w-12"
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

        {/* Details */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between pb-2">
            <h2 className="text-lg font-semibold text-gray-900 lg:text-2xl">
              {name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                aria-label={t('productDetails.productInfo.editProduct')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                aria-label={t('managementTable.deleteProduct', {
                  name: name || 'Product',
                })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap">
            <div className="flex gap-0.5 sm:flex-row sm:gap-2">
              <span className="text-gray-400">
                {t('productDetails.productInfo.category')}
              </span>
              <span className="font-bold text-gray-700">{category}</span>
            </div>
            <div className="flex gap-0.5 sm:flex-row sm:gap-2">
              <span className="text-gray-400">
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

          <div className="my-3 lg:my-6 flex flex-col gap-2 sm:flex-row sm:gap-2 items-start">
            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold text-gray-900">
                {price} {currency}
              </span>
              {compareAtPrice != null &&
                Number(compareAtPrice) > Number(price ?? 0) &&
                Number(compareAtPrice) > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {compareAtPrice} {currency}
                  </span>
                )}
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
                  className={`rounded-md px-2 py-1 text-xs font-medium ${inStock
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

            <div className="flex items-center gap-4">
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

      {variants.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            {isArabic ? 'خيارات المنتج والأنواع' : 'Product Options & Variants'}
          </h3>
          <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full border-collapse text-left text-xs rtl:text-right">
              <thead className="border-b border-gray-100 bg-gray-50 font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  {options.map((option, index) => (
                    <th key={option.id || index} className="px-4 py-3">
                      {isArabic
                        ? option.nameAr || option.name || '-'
                        : option.name || option.nameAr || '-'}
                    </th>
                  ))}
                  <th className="px-4 py-3">{isArabic ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-3">
                    {isArabic ? 'المخزون' : 'Stock'}
                  </th>
                  <th className="px-4 py-3">
                    {isArabic ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant, variantIndex) => {
                  const optionValues = Array.isArray(variant.optionValues)
                    ? (variant.optionValues as VariantOptionValue[])
                    : [];

                  return (
                    <tr
                      key={variant.id || variant.sku || variantIndex}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-gray-800">
                        {variant.sku || '-'}
                      </td>
                      {options.map((option, optionIndex) => {
                        const optionValue = optionValues.find((value) =>
                          option.id
                            ? value.optionId === option.id
                            : value.optionName === option.name ||
                            value.optionNameAr === option.nameAr
                        );

                        return (
                          <td
                            key={option.id || optionIndex}
                            className="px-4 py-3 text-gray-700"
                          >
                            {optionValue
                              ? isArabic
                                ? optionValue.valueAr ||
                                optionValue.value ||
                                '-'
                                : optionValue.value ||
                                optionValue.valueAr ||
                                '-'
                              : '-'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {(variant.price ?? 0).toLocaleString()} {currency}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {variant.stock ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${variant.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                          {variant.isActive
                            ? isArabic
                              ? 'نشط'
                              : 'Active'
                            : isArabic
                              ? 'غير نشط'
                              : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
