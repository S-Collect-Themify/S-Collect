import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { ProductFormData } from '../types';
import TagInput from '../TagInput';
import BasicInfoFields from '../BasicInfoFields';
import CategorySelect from '../CategorySelect';
import { useMobileAddProductStore } from './mobileAddProductStore';
import { deleteProductOptionValue } from '../../../services/products';

const MobileBasicInfoStep = () => {
  const { t } = useTranslation();
  const { productId } = useParams<{ productId: string }>();
  const { trigger, getValues } = useFormContext<ProductFormData>();

  const {
    sizes,
    colors,
    addSize,
    removeSize,
    addColor,
    removeColor,
    nextStep,
  } = useMobileAddProductStore();

  const removeOptionValue = async (
    optionName: 'size' | 'color',
    value: string,
    remove: () => void
  ) => {
    if (productId) {
      const option = getValues('optionsMeta')?.find(
        (item) => item.name.trim().toLowerCase() === optionName
      );
      const optionValue = option?.values.find(
        (item) =>
          item.value.trim().toLowerCase() === value.trim().toLowerCase() ||
          item.valueAr.trim().toLowerCase() === value.trim().toLowerCase()
      );

      if (option?.id && optionValue?.id) {
        const isUsedByVariant = getValues('variantsMeta')?.some((variant) =>
          variant.optionValueIds.includes(optionValue.id)
        );

        if (isUsedByVariant) {
          toast.error(
            t(
              'addProduct.optionValueInUse',
              'This value is used by a variant. Delete the linked variant first.'
            )
          );
          return;
        }

        try {
          await deleteProductOptionValue(productId, option.id, optionValue.id);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to delete option value'
          );
          return;
        }
      }
    }

    remove();
  };

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
      <CategorySelect />

      {/* Sizes */}
      <TagInput
        label={t('addProduct.sizes')}
        required
        items={sizes}
        onAdd={addSize}
        onRemove={(index) =>
          removeOptionValue('size', sizes[index], () => removeSize(index))
        }
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
        onRemove={(index) =>
          removeOptionValue('color', colors[index], () => removeColor(index))
        }
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
