import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  X,
  Megaphone,
  Send,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  UploadCloud,
  Trash2,
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
  imageUrl?: string;
}

export const CreateCampaignModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateCampaignModalProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleRemoveFile();
      reset();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleRemoveFile();
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
      imageUrl: values.imageUrl?.trim() || undefined,
      imageFile: selectedFile,
    };
    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={handleClose}
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
            onClick={handleClose}
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

          {/* Photo Upload Section */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} className="text-gray-400" />
                {t('campaigns.form.photoUploadLabel', 'Notification Image')}
              </span>
              <span className="text-[11px] font-normal text-gray-400">
                {t('campaigns.form.optionalLabel', '(Optional)')}
              </span>
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile && previewUrl ? (
              <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-3 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0 shadow-2xs bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title={t('common.remove', 'Remove image')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (isSubmitting) return;
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-2xs">
                  <UploadCloud size={20} />
                </div>
                <div className="text-xs font-semibold text-gray-700">
                  {t('campaigns.form.uploadPrompt', 'Click to upload image or drag and drop')}
                </div>
                <p className="text-[11px] text-gray-400">PNG, JPG, WebP, GIF</p>
              </div>
            )}

            {!selectedFile && (
              <div className="pt-1">
                <div className="flex items-center gap-2 my-2">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {t('campaigns.form.orDirectUrl', 'or enter image URL directly')}
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  {...register('imageUrl')}
                />
              </div>
            )}
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
              onClick={handleClose}
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
