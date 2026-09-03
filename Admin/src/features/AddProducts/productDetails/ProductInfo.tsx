import { useState } from "react";
import { Star, Pencil, CheckCircle, XCircle, Award, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SingleAdminProductDetail } from "../../../services/products";
import ProductVariantsTable from "./ProductVariantsTable";
import Toggle from "../../../components/ui/Toggle";

export interface ProductInfoProps {
  productDetail?: SingleAdminProductDetail | null;
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
  onToggleStatus?: (product: SingleAdminProductDetail) => void;
}

const BROKEN_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23F9FAFB' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/><line x1='2' x2='22' y1='2' y2='22'/><circle cx='9' cy='9' r='2'/></svg>";

export default function ProductInfo({
  productDetail,
  imageUrl,
  name,
  category,
  brand,
  sku,
  price,
  compareAtPrice,
  cost,
  currency = "SAR",
  inStock,
  stockCount,
  averageRating = 0,
  totalReviews = 0,
  onEdit,
  onToggleStatus,
}: ProductInfoProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const currencySymbol = isAr ? '﷼' : (currency || 'SAR');

  // Compute values from productDetail if provided
  const images = productDetail?.images || [];
  const initialImage =
    images.find((img) => img.isThumbnail)?.url ||
    images[0]?.url ||
    imageUrl ||
    BROKEN_IMAGE_FALLBACK;

  const [selectedImage, setSelectedImage] = useState<string>(initialImage);

  const displayName = productDetail
    ? isAr && productDetail.nameAr
      ? productDetail.nameAr
      : productDetail.name
    : name;

  const displayCategory = productDetail
    ? isAr && productDetail.category?.nameAr
      ? productDetail.category.nameAr
      : productDetail.category?.name || '-'
    : category;

  const displayVendor = productDetail
    ? isAr && productDetail.vendor?.storeNameAr
      ? productDetail.vendor.storeNameAr
      : productDetail.vendor?.storeName || '-'
    : brand;

  const descriptionText = productDetail
    ? isAr && productDetail.descriptionAr
      ? productDetail.descriptionAr
      : productDetail.description || ''
    : '';

  // Calculate prices and stock from variants if available
  const variants = productDetail?.variants || [];
  const prices = variants.map((v) => v.price).filter((p) => typeof p === 'number');
  const minPrice = prices.length > 0 ? Math.min(...prices) : price || 0;
  const comparePrice = variants[0]?.compareAtPrice || compareAtPrice;
  const computedStock = variants.length > 0
    ? variants.reduce((acc, v) => acc + (v.stock || 0), 0)
    : stockCount || 0;
  const computedInStock = productDetail ? computedStock > 0 : (inStock ?? computedStock > 0);

  const primarySku = variants[0]?.sku || sku || '-';

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 lg:p-6 space-y-6">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Gallery / Image Column */}
        <div className="flex flex-col gap-3 lg:w-100 shrink-0">
          <div className="h-70 w-full lg:h-100 overflow-hidden rounded-xl bg-gray-100 border border-gray-100 relative">
            <img
              src={selectedImage || BROKEN_IMAGE_FALLBACK}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = BROKEN_IMAGE_FALLBACK;
              }}
            />
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`size-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImage === img.url
                      ? 'border-gray-900 ring-2 ring-gray-900/10'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 lg:text-2xl">{displayName}</h2>
                
                {/* Status Badges & Toggle */}
                {productDetail && (
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        productDetail.isActive && !productDetail.isDisabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {productDetail.isActive && !productDetail.isDisabled ? (
                        <>
                          <CheckCircle size={12} />
                          {isAr ? 'نشط' : 'Active'}
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          {isAr ? 'معطل' : 'Disabled'}
                        </>
                      )}
                    </span>

                    {onToggleStatus && (
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-200 rtl:border-l-0 rtl:border-r rtl:pr-2">
                        <Toggle
                          checked={Boolean(productDetail.isActive && !productDetail.isDisabled)}
                          onChange={() => onToggleStatus(productDetail)}
                        />
                        <span className="text-xs text-gray-500 font-medium select-none">
                          {productDetail.isActive && !productDetail.isDisabled
                            ? isAr ? 'تعطيل المنتج' : 'Disable Product'
                            : isAr ? 'تفعيل المنتج' : 'Enable Product'}
                        </span>
                      </div>
                    )}

                    {productDetail.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Award size={12} />
                        {isAr ? 'مميز' : 'Featured'}
                      </span>
                    )}

                    {productDetail.isBestSeller && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <Flame size={12} />
                        {isAr ? 'الأكثر مبيعاً' : 'Best Seller'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label={t("productDetails.productInfo.editProduct", { defaultValue: "Edit Product" })}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap">
              <div className="flex gap-1 sm:gap-2">
                <span className="text-gray-400">{t("productDetails.productInfo.category", { defaultValue: "Category:" })}</span>
                <span className="font-bold text-gray-700">{displayCategory}</span>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <span className="text-gray-400">{isAr ? "المتجر / المورد:" : "Store / Vendor:"}</span>
                <span className="font-bold text-gray-700">{displayVendor}</span>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <span className="text-gray-400">{t("productDetails.productInfo.sku", { defaultValue: "SKU:" })}</span>
                <span className="font-bold text-gray-700">{primarySku}</span>
              </div>
            </div>

            <div className="my-4 lg:my-6 flex flex-col gap-2 sm:flex-row items-baseline sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {minPrice.toLocaleString()} {currencySymbol}
                </span>
                {comparePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {comparePrice.toLocaleString()} {currencySymbol}
                  </span>
                )}
              </div>
              {cost !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{t("productDetails.productInfo.cost", { defaultValue: "Cost:" })}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {cost.toLocaleString()} {currencySymbol}
                  </span>
                </div>
              )}
            </div>

            {/* Product Description */}
            {descriptionText && (
              <div className="mb-6 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 mb-1">
                  {isAr ? 'الوصف' : 'Description'}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {descriptionText}
                </p>
              </div>
            )}
          </div>

          <div>
            <hr className="mb-4 border-gray-100" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-12">
              <div>
                <p className="text-xs text-gray-400">{t("productDetails.productInfo.inventory", { defaultValue: "Inventory" })}</p>
                <p className="mt-1">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      computedInStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {computedInStock
                      ? `${t("productDetails.productInfo.inStock", { defaultValue: "In Stock" })} (${computedStock} ${t("productDetails.productInfo.units", { defaultValue: "units" })})`
                      : `${t("productDetails.productInfo.outOfStock", { defaultValue: "Out of Stock" })} (${computedStock} ${t("productDetails.productInfo.units", { defaultValue: "units" })})`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">{t("productDetails.productInfo.averageRating", { defaultValue: "Average Rating" })}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-sm font-semibold text-gray-800">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    {(typeof averageRating === 'number' && !isNaN(averageRating) ? averageRating : 0).toFixed(1)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">{t("productDetails.productInfo.totalReviews", { defaultValue: "Total Reviews" })}</p>
                  <p className="mt-1.5 text-sm font-semibold text-gray-800">
                    {t("productDetails.productInfo.reviewsCount", { count: totalReviews || 0, defaultValue: `${totalReviews || 0} Reviews` })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Variants Table with Skeleton & 20-item Pagination */}
      <ProductVariantsTable variants={variants} currency={currencySymbol} />
    </div>
  );
}

