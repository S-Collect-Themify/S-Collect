import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  X,
  Megaphone,
  Send,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import type { CreatePushCampaignDto } from '../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePushCampaignDto) => Promise<void>;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  imageUrl: string;
}

export const CreateCampaignModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateCampaignModalProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      titleAr: '',
      body: '',
      bodyAr: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        titleAr: '',
        body: '',
        bodyAr: '',
        imageUrl: '',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: FormValues) => {
    const payload: CreatePushCampaignDto = {
      title: values.title.trim(),
      body: values.body.trim(),
      titleAr: values.titleAr.trim() || undefined,
      bodyAr: values.bodyAr.trim() || undefined,
      imageUrl: values.imageUrl.trim() || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gray-100 text-gray-900">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {t('campaigns.modal.createTitle', 'Create Push Notification')}
              </h2>
              <p className="text-xs text-gray-500">
                {t('campaigns.modal.subtitle', 'Send an instant notification to all active buyers')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Form & Live Preview */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
        
          {/* Form Fields: English Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">
              {t('campaigns.form.englishSection', 'English Content')}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('campaigns.form.titleEn', 'Notification Title (English)')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder={t('campaigns.form.titleEnPlaceholder', 'e.g., Special Weekend Offer!')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${
                  errors.title
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-200 hover:border-gray-300 focus:border-gray-900'
                }`}
                {...register('title', {
                  required: t(
                    'campaigns.form.titleEnRequired',
                    'English title is required'
                  ),
                })}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('campaigns.form.bodyEn', 'Notification Body (English)')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                dir="ltr"
                rows={3}
                placeholder={t('campaigns.form.bodyEnPlaceholder', 'e.g., Enjoy up to 30% off on all products for a limited time.')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none ${
                  errors.body
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-200 hover:border-gray-300 focus:border-gray-900'
                }`}
                {...register('body', {
                  required: t(
                    'campaigns.form.bodyEnRequired',
                    'English notification message is required'
                  ),
                })}
              />
              {errors.body && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.body.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields: Arabic Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">
              {t('campaigns.form.arabicSection', 'Arabic Content (محتوى الإشعار بالعربية)')}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('campaigns.form.titleAr', 'عنوان الإشعار (العربية)')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder={t('campaigns.form.titleArPlaceholder', 'مثال: عرض نهاية الأسبوع الخاص!')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${
                  errors.titleAr
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-200 hover:border-gray-300 focus:border-gray-900'
                }`}
                {...register('titleAr', {
                  required: t(
                    'campaigns.form.titleArRequired',
                    'Arabic title is required'
                  ),
                })}
              />
              {errors.titleAr && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.titleAr.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('campaigns.form.bodyAr', 'نص الإشعار (العربية)')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                dir="rtl"
                rows={3}
                placeholder={t('campaigns.form.bodyArPlaceholder', 'مثال: احصل على خصم 30% على جميع المنتجات لفترة محدودة.')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none ${
                  errors.bodyAr
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-gray-200 hover:border-gray-300 focus:border-gray-900'
                }`}
                {...register('bodyAr', {
                  required: t(
                    'campaigns.form.bodyArRequired',
                    'Arabic notification message is required'
                  ),
                })}
              />
              {errors.bodyAr && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.bodyAr.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Field: Image URL (Optional) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('campaigns.form.imageUrl', 'Banner Image URL (Optional)')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none rtl:left-auto rtl:right-3">
                <ImageIcon size={16} />
              </span>
              <input
                type="url"
                dir="ltr"
                placeholder="https://example.com/banner.jpg"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all rtl:pl-4 rtl:pr-9"
                {...register('imageUrl')}
              />
            </div>
            <p className="mt-1 text-2xs text-gray-400">
              {t('campaigns.form.imageUrlHint', 'Optional banner image displayed in rich push notifications')}
            </p>
          </div>

          {/* Dispatch Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              {t(
                'campaigns.form.dispatchNotice',
                'Submitting this will immediately broadcast the push notification to all registered buyer devices.'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{t('campaigns.form.sending', 'Sending Notification...')}</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>{t('campaigns.form.sendNow', 'Send Push Campaign')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
