// pages/AddProduct/ProductPreviewCard.tsx
import type { ProductFormData } from './types';

interface ProductPreviewCardProps {
  formData: ProductFormData;
  categories: string[];
  sizes: string[];
  colors: string[];
  quantity: number;
}

const TagList = ({ label, items }: { label: string; items: string[] }) => (
  <div className="mt-4">
    <p className="text-gray-400 text-xs mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium"
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
}: ProductPreviewCardProps) => {
  const thumbnailImage =
    formData.existingImages?.find((img) => img.isThumbnail) ||
    formData.existingImages?.[0];
  const newImagePreview = formData.images?.[0];
  const thumbnailUrl = thumbnailImage?.url;
  const thumbnailSrc =
    thumbnailUrl ||
    (newImagePreview ? URL.createObjectURL(newImagePreview) : undefined);

  return (
    <div className="rounded-2xl border border-gray-200 p-6 bg-white">
      <div className="flex gap-5">
        <div className="h-24 w-24 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={formData.nameEn || formData.nameAr}
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

        <div>
          <p className="text-xs text-gray-400 mb-0.5">Product</p>
          <h2 className="text-lg font-bold leading-tight">
            {formData.nameEn || formData.nameAr || '—'}
          </h2>
          {formData.basePrice && (
            <p className="mt-1 text-base font-semibold text-gray-800">
              ${formData.basePrice}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Brand</p>
          <p className="font-medium">{formData.sku || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">SKU</p>
          <p className="font-medium">{formData.sku || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Stock</p>
          <p className="font-medium">{quantity} units</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Status</p>
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Active
          </span>
        </div>
        {formData.comparePrice && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Discount</p>
            <p className="font-medium">${formData.comparePrice}</p>
          </div>
        )}
        {formData.basePrice && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Cost</p>
            <p className="font-medium">${formData.basePrice}</p>
          </div>
        )}
      </div>

      {(formData.description || formData.descriptionAr) && (
        <div className="mt-4 space-y-2">
          {formData.description && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                {formData.description}
              </p>
            </div>
          )}
          {formData.descriptionAr && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">الوصف</p>
              <p
                dir="rtl"
                className="text-sm text-gray-700 leading-relaxed line-clamp-2"
              >
                {formData.descriptionAr}
              </p>
            </div>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <TagList label="Categories" items={categories} />
      )}
      {sizes.length > 0 && <TagList label="Sizes" items={sizes} />}
      {colors.length > 0 && <TagList label="Colors" items={colors} />}
    </div>
  );
};

export default ProductPreviewCard;
