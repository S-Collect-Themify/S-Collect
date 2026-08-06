import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from './types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import MobileImageUploader from './mobile/MobileImageUploader';

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
          {t('addProduct.nameAr', 'Product Name ( in arabic )')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls(errors.nameAr?.message)}
          placeholder={t('addProduct.nameArPlaceholder', 'Summer Dress')}
          {...register('nameAr', {
            required: t('addProduct.errors.nameArRequired'),
          })}
        />
        {errors.nameAr ? (
          <p className={errorCls}>{errors.nameAr.message}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">Hint...</p>
        )}
      </div>

      <div>
        <label className={labelCls}>
          {t('addProduct.nameEn', 'Product Name ( in english )')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          className={inputCls(errors.nameEn?.message)}
          placeholder={t('addProduct.nameEnPlaceholder', 'Summer Dress')}
          {...register('nameEn', {
            required: t('addProduct.errors.nameEnRequired'),
          })}
        />
        {errors.nameEn ? (
          <p className={errorCls}>{errors.nameEn.message}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">Hint...</p>
        )}
      </div>



      <div>
        <label className={labelCls}>
          {t('addProduct.descriptionEn', 'Description (English)')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={isMobile ? 4 : 5}
          className={inputCls(errors.description?.message)}
          placeholder={t('addProduct.descriptionEnPlaceholder')}
          {...register('description', {
            required: t('addProduct.errors.descriptionRequired'),
          })}
        />
        {errors.description && (
          <p className={errorCls}>{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className={labelCls}>
          {t('addProduct.descriptionAr', 'Description (Arabic)')}{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={isMobile ? 4 : 5}
          className={inputCls(errors.descriptionAr?.message)}
          placeholder={t('addProduct.descriptionArPlaceholder')}
          dir="rtl"
          {...register('descriptionAr', {
            required: t('addProduct.errors.descriptionArRequired'),
          })}
        />
        {errors.descriptionAr && (
          <p className={errorCls}>{errors.descriptionAr.message}</p>
        )}
      </div>
    </>
  );
};

export default BasicInfoFields;
