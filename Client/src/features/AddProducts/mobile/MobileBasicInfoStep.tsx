import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from '../types';
import TagInput from '../TagInput';
import BasicInfoFields from '../BasicInfoFields';
import { useMobileAddProductStore } from './mobileAddProductStore';

const MobileBasicInfoStep = () => {
  const { t } = useTranslation();
  const { trigger } = useFormContext<ProductFormData>();

  const {
    sizes,
    colors,
    addSize,
    removeSize,
    addColor,
    removeColor,
    nextStep,
  } = useMobileAddProductStore();

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
    <div className="flex flex-col gap-5">
      <BasicInfoFields />

      {/* Sizes */}
      <TagInput
        label={t('addProduct.sizes')}
        required
        items={sizes}
        onAdd={addSize}
        onRemove={removeSize}
        placeholder={t('addProduct.enterSize')}
        addLabel={t('addProduct.addSize')}
        addBtnLabel={t('addProduct.add')}
        cancelBtnLabel={t('addProduct.cancel')}
      />

      {/* Colors */}
      <TagInput
        label={t('addProduct.colors')}
        required
        items={colors}
        onAdd={addColor}
        onRemove={removeColor}
        placeholder={t('addProduct.enterColor')}
        addLabel={t('addProduct.addColor')}
        addBtnLabel={t('addProduct.add')}
        cancelBtnLabel={t('addProduct.cancel')}
      />

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {t('addProduct.continue')}
        </button>
      </div>
    </div>
  );
};

export default MobileBasicInfoStep;
