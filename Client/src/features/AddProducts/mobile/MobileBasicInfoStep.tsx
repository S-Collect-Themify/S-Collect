import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from '../types';
import BasicInfoFields from '../BasicInfoFields';
import CategorySelect from '../CategorySelect';
import { useMobileAddProductStore } from './mobileAddProductStore';

const MobileBasicInfoStep = () => {
  const { t } = useTranslation();
  const { trigger } = useFormContext<ProductFormData>();

  const { nextStep } = useMobileAddProductStore();

  const handleContinue = async () => {
    const valid = await trigger([
      'nameAr',
      'nameEn',
      'description',
      'descriptionAr',
      'categoryId',
    ]);
    if (valid) nextStep();
  };

  return (
    <div className="flex flex-col md:gap-5 gap-3">
      <BasicInfoFields />
      <CategorySelect />

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {t('addProduct.continue', 'Continue')}
        </button>
      </div>
    </div>
  );
};

export default MobileBasicInfoStep;
