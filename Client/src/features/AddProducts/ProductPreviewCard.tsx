import { useTranslation } from 'react-i18next';
import type { ProductFormData, VarianceCardData } from './types';

interface ProductPreviewCardProps {
  formData: ProductFormData;
  categories: string[];
  sizes: string[];
  colors: string[];
  quantity: number;
  varianceCards?: VarianceCardData[];
}

const TagList = ({ label, items }: { label: string; items: string[] }) => (
  <div className="mt-6 border-t border-gray-100 pt-5">
    <p className="text-xs text-gray-400 font-medium mb-3">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded-lg bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-800"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const ProductPreviewCard = ({
  formData,
  categories,
  sizes,
  colors,
  quantity,
  varianceCards,
}: ProductPreviewCardProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const thumbnailImage =
    formData.existingImages?.find((img) => img.isThumbnail) ||
    formData.existingImages?.[0];
  const newImagePreview = formData.images?.[0];
  const thumbnailUrl = thumbnailImage?.url;
  const thumbnailSrc =
    thumbnailUrl ||
    (newImagePreview ? URL.createObjectURL(newImagePreview) : undefined);

  const productName =
    (isArabic
      ? formData.nameAr || formData.nameEn
      : formData.nameEn || formData.nameAr) ||
    t('addProduct.preview.productName', 'Product Name');
  const categoryName =
    categories[0] || t('addProduct.preview.uncategorized', 'Uncategorized');
  const price = formData.basePrice ? `${formData.basePrice} SAR` : '0.00 SAR';
  const discountPrice = formData.comparePrice
    ? `${formData.comparePrice} SAR`
    : '—';
  const costPrice = formData.basePrice ? `${formData.basePrice} SAR` : '—';
  const sku = formData.sku || '—';
  const brand = categories[0] || t('addProduct.preview.generic', 'Generic');

  return (
    <div className="rounded-2xl border border-gray-200 p-6 md:p-8 bg-white shadow-xs">
      {/* Top Section: Image + Title + Category + Price */}
      <div className="flex gap-6 items-start">
        <div className="h-28 w-28 md:h-36 md:w-36 shrink-0 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              className="h-10 w-10 text-gray-300"
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
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate leading-snug">
            {productName}
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-400">
            {categoryName}
          </p>
          <p className="mt-3 text-lg md:text-xl font-bold text-gray-900">
            {price}
          </p>
        </div>
      </div>

      {/* Middle Grid Section */}
      <div className="mt-6 border-t border-gray-100 pt-6 grid grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.brand', 'Brand')}
          </p>
          <p className="text-sm font-bold text-gray-900">{brand}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.sku', 'SKU')}
          </p>
          <p className="text-sm font-bold text-gray-900">{sku}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.stock', 'Stock')}
          </p>
          <p className="text-sm font-bold text-gray-900">
            {quantity} {t('addProduct.preview.units', 'units')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.status', 'Status')}
          </p>
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-600">
              {t('addProduct.active', 'Active')}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.discount', 'Discount')}
          </p>
          <p className="text-sm font-bold text-gray-900">{discountPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">
            {t('addProduct.preview.cost', 'Cost')}
          </p>
          <p className="text-sm font-bold text-gray-900">{costPrice}</p>
        </div>
      </div>

      {/* Descriptions */}
      {(formData.description || formData.descriptionAr) && (
        <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
          {formData.description && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                {t('addProduct.preview.description', 'Description')}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {formData.description}
              </p>
            </div>
          )}
          {formData.descriptionAr && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">
                {t('addProduct.preview.descriptionAr', 'الوصف')}
              </p>
              <p
                dir="rtl"
                className="text-sm text-gray-700 leading-relaxed"
              >
                {formData.descriptionAr}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Categories & Tags */}
      {categories.length > 0 && (
        <TagList
          label={t('addProduct.categories', 'Categories')}
          items={categories}
        />
      )}

      {/* Variance Cards List */}
      {varianceCards && varianceCards.length > 0 ? (
        <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            {t('addProduct.preview.productVariances', 'Product Variances')} (
            {varianceCards.length})
          </p>
          <div className="grid grid-cols-1 gap-3">
            {varianceCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="rounded-xl border border-gray-150 bg-gray-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      {t('addProduct.preview.variance', 'Variance')} #{idx + 1}
                    </span>
                    {card.sku && (
                      <span className="font-mono text-xs text-gray-400">
                        ({card.sku})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {card.size && (
                      <span className="rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-800">
                        {t('addProduct.size', 'Size')}: {card.size}
                      </span>
                    )}
                    {card.color && (
                      <span className="rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-800">
                        {t('addProduct.color', 'Color')}: {card.color}
                      </span>
                    )}
                    {typeof card.stock === 'number' && (
                      <span className="rounded-md bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {t('addProduct.stockQuantity', 'Stock')}: {card.stock}
                      </span>
                    )}
                  </div>
                </div>
                {(card.basePrice || card.comparePrice) && (
                  <div className="text-left sm:text-right rtl:sm:text-left rtl:text-right">
                    {card.basePrice && (
                      <p className="text-sm font-bold text-gray-900">
                        {card.basePrice} SAR
                      </p>
                    )}
                    {card.comparePrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {card.comparePrice} SAR
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {sizes.length > 0 && (
            <TagList label={t('addProduct.sizes', 'Sizes')} items={sizes} />
          )}
          {colors.length > 0 && (
            <TagList label={t('addProduct.colors', 'Colors')} items={colors} />
          )}
        </>
      )}
    </div>
  );
};

export default ProductPreviewCard;
