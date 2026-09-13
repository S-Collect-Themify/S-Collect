import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from './types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import MobileImageUploader from './mobile/MobileImageUploader';
import CategorySeasonFields from './CategorySeasonFields';

const BasicInfoFields = () => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { isMobile } = useBreakpoint();

  const inputCls = (hasError?: string) =>
    `w-full rounded-xl border py-2.5 focus:outline-none ${
      isMobile ? 'px-3.5 text-sm' : 'px-4'
    } ${
      hasError
        ? isMobile
          ? 'border-red-400 focus:border-red-400'
          : 'border-red-500 focus:border-red-500'
        : isMobile
          ? 'border-gray-200 focus:border-gray-900'
          : 'border-gray-300 focus:border-gray-950'
    }`;

  const labelCls = isMobile
    ? 'mb-2 block text-sm font-medium text-gray-700'
    : 'mb-2 block font-medium';

  const errorCls = isMobile
    ? 'mt-1 text-xs text-red-500'
    : 'mt-1 text-sm text-red-500';

  return (
    <>
      {isMobile && <MobileImageUploader />}
      <div>
        <label className={labelCls}>
          {t('addProduct.nameAr')} <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls(errors.nameAr?.message)}
          placeholder={t('addProduct.nameArPlaceholder')}
          {...register('nameAr', {
            required: t('addProduct.errors.nameArRequired'),
          })}
        />
        {errors.nameAr && <p className={errorCls}>{errors.nameAr.message}</p>}
      </div>

      <div>
        <label className={labelCls}>
          {t('addProduct.nameEn')} <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls(errors.nameEn?.message)}
          placeholder={t('addProduct.nameEnPlaceholder')}
          {...register('nameEn', {
            required: t('addProduct.errors.nameEnRequired'),
          })}
        />
        {errors.nameEn && <p className={errorCls}>{errors.nameEn.message}</p>}
      </div>

      <CategorySeasonFields />

      <div>
        <label className={labelCls}>
          {t('addProduct.description')} <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={isMobile ? 4 : 5}
          className={inputCls(errors.description?.message)}
          placeholder={t('addProduct.descriptionPlaceholder')}
          {...register('description', {
            required: t('addProduct.errors.descriptionRequired'),
          })}
        />
        {errors.description && (
          <p className={errorCls}>{errors.description.message}</p>
        )}
      </div>
    </>
  );
};

export default BasicInfoFields;
