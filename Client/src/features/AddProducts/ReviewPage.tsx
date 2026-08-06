// pages/AddProduct/ReviewPage.tsx
import { ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import ProductPreviewCard from './ProductPreviewCard';
import StepSummary from './StepSummary';
import type { ProductFormData } from './types';
import { containerVariants, itemVariants } from '../../utils/animations';

export interface VarianceCardItem {
  id: string;
  sizes: string[];
  colors: string[];
  basePrice: string;
  comparePrice: string;
}

interface ReviewPageProps {
  formData: ProductFormData;
  categories: string[];
  sizes: string[];
  colors: string[];
  quantity: number;
  varianceCards?: VarianceCardItem[];
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
  varianceCards,
  onPrevious,
  onPublish,
  isPublishing,
  isEdit,
}: ReviewPageProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sidebar-page-container-header border-b border-gray-100">
        <h1 className="heading-page-title font-bold text-gray-900">
          {isEdit ? t('addProduct.editTitle', 'Edit Product') : t('addProduct.title', 'Add Product')}
        </h1>
        <nav className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-500">
          <span
            className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onPrevious}
          >
            {isEdit ? t('addProduct.editTitle', 'Edit Product') : t('addProduct.title', 'Add Product')}
          </span>
          <span className="flex items-center text-gray-400">
            <ChevronsRight size={16} />
          </span>
          <span className="text-gray-900 font-medium">
            {isEdit ? t('addProduct.updated', 'Updated') : t('addProduct.published', 'Published')}
          </span>
        </nav>
      </div>

      <motion.div
        className="sidebar-page-container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="py-2">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px] xl:gap-8 items-start">
            <motion.div variants={itemVariants}>
              <ProductPreviewCard
                formData={formData}
                categories={categories}
                sizes={sizes}
                colors={colors}
                quantity={quantity}
                varianceCards={varianceCards}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <StepSummary
                onPrevious={onPrevious}
                onPublish={onPublish}
                isPublishing={isPublishing}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ReviewPage;
