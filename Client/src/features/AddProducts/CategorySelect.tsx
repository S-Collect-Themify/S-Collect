import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProductFormData } from './types';
import { useCategories } from '../../hooks/useCategories';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ModernSelect } from '../../components/ui/ModernSelect';

const CategorySelect = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { isMobile } = useBreakpoint();
  const { categories: categoriesList, isLoading } = useCategories();

  const labelCls = isMobile
    ? 'mb-2 block text-sm font-medium text-gray-700'
    : 'mb-2 block font-medium';

  const errorCls = isMobile
    ? 'mt-1 text-xs text-red-500'
    : 'mt-1 text-sm text-red-500';

  const categoryOptions = Array.isArray(categoriesList)
    ? categoriesList.map((cat) => ({
        label: isArabic ? cat.nameAr || cat.name : cat.name,
        value: cat.id,
      }))
    : [];

  return (
    <div>
      <label className={labelCls}>
        {t('addProduct.category', 'Category')}{' '}
        <span className="text-red-500">*</span>
      </label>
      <Controller
        name="categoryId"
        control={control}
        rules={{
          required: t(
            'addProduct.errors.categoryRequired',
            'Category is required'
          ),
        }}
        render={({ field }) => (
          <ModernSelect
            value={field.value || ''}
            onChange={(val) => field.onChange(val)}
            options={categoryOptions}
            placeholder={
              isLoading
                ? t('addProduct.loadingCategories', 'Loading categories...')
                : t('addProduct.selectCategory', 'Select a category')
            }
            size={isMobile ? 'sm' : 'md'}
            isSearchable={true}
            maxHeight={260}
            className={
              errors.categoryId
                ? isMobile
                  ? '!border-red-400 focus:!border-red-400'
                  : '!border-red-500 focus:!border-red-500'
                : ''
            }
          />
        )}
      />
      {errors.categoryId && (
        <p className={errorCls}>{errors.categoryId.message}</p>
      )}
    </div>
  );
};

export default CategorySelect;
