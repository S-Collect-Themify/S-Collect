// pages/AddProduct/ReviewPage.tsx
import ProductPreviewCard from './ProductPreviewCard';
import StepSummary from './StepSummary';
import type { ProductFormData } from './types';

interface ReviewPageProps {
  formData: ProductFormData;
  categories: string[];
  sizes: string[];
  colors: string[];
  quantity: number;
  onPrevious: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
  isEdit?: boolean;
}

const ReviewPage = ({
  formData,
  categories,
  sizes,
  colors,
  quantity,
  onPrevious,
  onPublish,
  isPublishing,
  isEdit,
}: ReviewPageProps) => (
  <div className="flex-1 overflow-y-auto  px-4 py-6 lg:p-14">
    <div className="mb-6 md:mb-8 md:ml-4">
      <h1 className="text-h5 font-bold">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
        <span className="cursor-pointer hover:underline" onClick={onPrevious}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </span>
        <span>»</span>
        <span className="text-gray-800 font-medium">
          {isEdit ? 'Updated' : 'Published'}
        </span>
      </div>
    </div>

    <div className="rounded-2xl p-4 shadow-sm md:p-6 md:shadow-none">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_440px] xl:gap-10">
        <ProductPreviewCard
          formData={formData}
          categories={categories}
          sizes={sizes}
          colors={colors}
          quantity={quantity}
        />
        <StepSummary
          onPrevious={onPrevious}
          onPublish={onPublish}
          isPublishing={isPublishing}
          isEdit={isEdit}
        />
      </div>
    </div>
  </div>
);

export default ReviewPage;
