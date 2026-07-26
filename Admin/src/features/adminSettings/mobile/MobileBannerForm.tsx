import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Upload, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAdminSettingsStore, MAX_ACTIVE_BANNERS } from '../store';
import i18n from '../../../i18n';
import toast from 'react-hot-toast';
import Toggle from '../../categories/components/Toggle';

interface MobileBannerFormProps {
  mode: 'add' | 'edit';
}

interface BannerFormInputs {
  name: string;
  redirectUrl: string;
  isActive: boolean;
}

export const MobileBannerForm: React.FC<MobileBannerFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { addBanner, updateBanner, editingBanner, setViewMode, banners } =
    useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const BreadcrumbChevron = isArabic ? ChevronLeft : ChevronRight;

  const [confirmEnableModalOpen, setConfirmEnableModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingBanner?.imageUrl || null
  );
  const [imageFileName, setImageFileName] = useState<string>(
    editingBanner?.imageFileName || 'winter-sale-banner.png'
  );
  const [imageDimensions, setImageDimensions] = useState<string>(
    editingBanner?.imageDimensions || 'Dimensions: 1200 × 480 px'
  );

  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormInputs>({
    defaultValues: {
      name: editingBanner?.name || '',
      redirectUrl: editingBanner?.redirectUrl || '',
      isActive: editingBanner ? editingBanner.isActive : false,
    },
  });

  const isActive = watch('isActive');
  const bannerNameValue = watch('name') || '';

  useEffect(() => {
    if (mode === 'edit' && editingBanner) {
      setValue('name', editingBanner.name);
      setValue('redirectUrl', editingBanner.redirectUrl);
      setValue('isActive', editingBanner.isActive);
      setImagePreview(editingBanner.imageUrl || null);
      setImageFileName(editingBanner.imageFileName || 'winter-sale-banner.png');
      setImageDimensions(
        editingBanner.imageDimensions || 'Dimensions: 1200 × 480 px'
      );
    }
  }, [mode, editingBanner, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB

    if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE) {
      setImageError(
        isArabic
          ? 'حجم صورة الـ Banner لا يتجاوز 3MB — الصيغ: PNG, JPG, WEBP.'
          : 'Banner image size must not exceed 3MB — Formats: PNG, JPG, WEBP.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageError(null);
      setImagePreview(objectUrl);
      setImageFileName(file.name);
      setImageDimensions(`Dimensions: ${img.width} × ${img.height} px`);
    };
    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleActive = () => {
    if (!isActive) {
      const activeCount = banners.filter(
        (b) => b.isActive && (mode === 'add' || b.id !== editingBanner?.id)
      ).length;

      if (activeCount >= MAX_ACTIVE_BANNERS) {
        toast.error(
          isArabic
            ? 'لا يمكن تفعيل أكثر من 5 بانرات في نفس الوقت.'
            : 'Cannot activate more than 5 banners at the same time.'
        );
        return;
      }
      setConfirmEnableModalOpen(true);
    } else {
      setValue('isActive', false);
    }
  };

  const handleConfirmEnable = () => {
    setValue('isActive', true);
    setConfirmEnableModalOpen(false);
  };

  const onSubmit = (data: BannerFormInputs) => {
    if (!imagePreview) {
      setImageError(
        isArabic ? 'صورة البانر مطلوبة' : 'Banner image is required'
      );
      return;
    }

    if (imageError) return;

    const bannerName = data.name.trim();

    if (mode === 'add') {
      addBanner({
        name: bannerName,
        redirectUrl: data.redirectUrl,
        isActive: data.isActive,
        imageUrl: imagePreview,
        imageFileName: imageFileName,
        imageDimensions: imageDimensions,
      });
    } else if (editingBanner) {
      updateBanner(editingBanner.id, {
        name: bannerName,
        redirectUrl: data.redirectUrl,
        isActive: data.isActive,
        imageUrl: imagePreview,
        imageFileName: imageFileName,
        imageDimensions: imageDimensions,
      });
    }
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {mode === 'add'
            ? t('banners.add.title', { defaultValue: 'Add New Banner' })
            : t('banners.edit.title', { defaultValue: 'Edit Banner' })}
        </h1>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <BreadcrumbChevron size={10} />
          <button
            type="button"
            onClick={() => setViewMode('banners')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.banners', { defaultValue: 'Banners' })}
          </button>
          <BreadcrumbChevron size={10} />
          <span className="text-gray-600 font-semibold">
            {mode === 'add'
              ? t('banners.breadcrumb.addNewBanner', { defaultValue: 'Add New Banner' })
              : t('banners.breadcrumb.editBanner', { defaultValue: 'Edit Banner' })}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Banner Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="mob-banner-name"
                className="text-sm font-semibold text-gray-900 block"
              >
                {t('banners.form.bannerTitle', { defaultValue: 'Banner Title' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-normal">
                {bannerNameValue.length}/50
              </span>
            </div>
            <input
              id="mob-banner-name"
              type="text"
              maxLength={50}
              {...register('name', {
                required: isArabic
                  ? 'عنوان البانر مطلوب'
                  : 'Banner title is required',
                minLength: {
                  value: 2,
                  message: isArabic
                    ? 'يجب أن يكون عنوان البانر بين 2 و 50 حرفاً'
                    : 'Banner title must be between 2 and 50 characters',
                },
                maxLength: {
                  value: 50,
                  message: isArabic
                    ? 'يجب ألا يتجاوز عنوان البانر 50 حرفاً'
                    : 'Banner title cannot exceed 50 characters',
                },
                validate: (val) => {
                  if (!val || !val.trim()) {
                    return isArabic
                      ? 'عنوان البانر مطلوب'
                      : 'Banner title is required';
                  }
                  if (val.trim().length < 2) {
                    return isArabic
                      ? 'يجب أن يكون عنوان البانر بين 2 و 50 حرفاً'
                      : 'Banner title must be between 2 and 50 characters';
                  }
                  if (val.trim().length > 50) {
                    return isArabic
                      ? 'يجب ألا يتجاوز عنوان البانر 50 حرفاً'
                      : 'Banner title cannot exceed 50 characters';
                  }
                  return true;
                },
              })}
              placeholder={
                isArabic
                  ? 'أدخل عنوان البانر (مثال: عروض الشتاء)'
                  : 'Enter banner title (e.g. Winter Sale)'
              }
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.name
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-gray-200 bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Banner Image */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              {t('banners.form.bannerImage', { defaultValue: 'Banner Image' })}{' '}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {imagePreview ? (
              /* Image Preview Box */
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Banner Preview"
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-1">
                      {imageFileName}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-normal mb-1">
                      {imageDimensions}
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer block"
                    >
                      {t('banners.form.removeImage', {
                        defaultValue: 'Remove Image',
                      })}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Box */
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  imageError
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50'
                }`}
              >
                {imageError ? (
                  <div className="flex flex-col items-center">
                    <AlertCircle className="size-7 text-red-500 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-red-500 mb-1">
                      {imageError}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="size-6 text-gray-400 mb-2 stroke-[1.75]" />
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      {t('banners.form.uploadBannerImage', {
                        defaultValue: 'Upload Banner Image',
                      })}
                    </p>
                    <p className="text-[11px] text-gray-400 font-normal">
                      {isArabic
                        ? 'PNG, JPG, WEBP — الحد الأقصى 3MB'
                        : 'PNG, JPG, WEBP — Max 3MB'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Redirect Link URL */}
          <div>
            <label
              htmlFor="mob-redirectUrl"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('banners.form.redirectLinkUrl', {
                defaultValue: 'Redirect Link URL',
              })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-redirectUrl"
              type="text"
              {...register('redirectUrl', {
                required: isArabic
                  ? 'رابط التوجيه مطلوب'
                  : 'Redirect link URL is required',
                validate: (val) => {
                  if (!val || !val.trim()) {
                    return isArabic
                      ? 'رابط التوجيه مطلوب'
                      : 'Redirect link URL is required';
                  }
                  const urlRegex =
                    /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=#]*)?$/i;
                  if (!urlRegex.test(val.trim())) {
                    return isArabic
                      ? 'يرجى إدخال رابط URL صحيح (مثال: https://example.com)'
                      : 'Please enter a valid URL (e.g. https://example.com)';
                  }
                  return true;
                },
              })}
              placeholder="https://example.com/target-page"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.redirectUrl
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-gray-200 bg-white'
              }`}
            />
            {errors.redirectUrl && (
              <p className="text-xs text-red-500 mt-1.5">
                {errors.redirectUrl.message}
              </p>
            )}
          </div>

          {/* Banner Status Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-900 block">
                  {t('banners.form.bannerStatus', {
                    defaultValue: 'Banner Status',
                  })}
                </label>
                <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                  {t('banners.form.bannerStatusHint', {
                    defaultValue:
                      'Active banners display on home instantly.',
                  })}
                </p>
              </div>

              <Toggle checked={isActive} onChange={handleToggleActive} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setViewMode('banners')}
              className="w-full py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('banners.form.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {mode === 'add'
                ? t('banners.form.saveBanner', { defaultValue: 'Save Banner' })
                : t('banners.form.saveChanges', { defaultValue: 'Save Changes' })}
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Enable Modal */}
      {confirmEnableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                {t('banners.enableModal.title', { defaultValue: 'Enable Banner' })}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                {t('banners.enableModal.message', {
                  defaultValue:
                    'Are you sure you want to enable this banner? It will immediately be displayed on the platform home page.',
                })}
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setConfirmEnableModalOpen(false)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEnable}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  {t('banners.enableModal.confirm', { defaultValue: 'Enable Banner' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
