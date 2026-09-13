import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Send, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CreatePushCampaignPayload } from '../../../services/pushCampaigns';

interface SendCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: CreatePushCampaignPayload) => void;
  isSending: boolean;
}

export const SendCampaignModal: React.FC<SendCampaignModalProps> = ({
  isOpen,
  onClose,
  onSend,
  isSending,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePushCampaignPayload>({
    defaultValues: {
      title: '',
      titleAr: '',
      body: '',
      bodyAr: '',
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

  const onSubmit = (data: CreatePushCampaignPayload) => {
    onSend({
      title: data.title.trim(),
      titleAr: data.titleAr.trim(),
      body: data.body.trim(),
      bodyAr: data.bodyAr.trim(),
      imageFile: selectedFile,
    });
  };

  const handleClose = () => {
    if (!isSending) {
      handleRemoveFile();
      reset();
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-2xs">
                  <Send size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {t('notificationsPage.sendModalTitle', 'Send Push Notification')}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t('notificationsPage.sendModalSubtitle', 'Broadcast a new push campaign to users')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title EN */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('notificationsPage.titleEnLabel', 'Title (English)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('notificationsPage.titleEnPlaceholder', 'e.g. Special Offer!')}
                  {...register('title', { required: t('notificationsPage.requiredField', 'This field is required') })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.title && (
                  <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.title.message}</p>
                )}
              </div>

              {/* Title AR */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('notificationsPage.titleArLabel', 'Title (Arabic)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder={t('notificationsPage.titleArPlaceholder', 'مثال: عرض خاص!')}
                  {...register('titleAr', { required: t('notificationsPage.requiredField', 'This field is required') })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.titleAr && (
                  <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.titleAr.message}</p>
                )}
              </div>

              {/* Body EN */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('notificationsPage.bodyEnLabel', 'Message Body (English)')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={t('notificationsPage.bodyEnPlaceholder', 'e.g. 30% off on all products for a limited time')}
                  {...register('body', { required: t('notificationsPage.requiredField', 'This field is required') })}
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                />
                {errors.body && (
                  <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.body.message}</p>
                )}
              </div>

              {/* Body AR */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('notificationsPage.bodyArLabel', 'Message Body (Arabic)')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder={t('notificationsPage.bodyArPlaceholder', 'مثال: خصم 30% على كل المنتجات لفترة محدودة')}
                  {...register('bodyAr', { required: t('notificationsPage.requiredField', 'This field is required') })}
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                />
                {errors.bodyAr && (
                  <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.bodyAr.message}</p>
                )}
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-gray-400" />
                    {t('notificationsPage.photoUploadLabel', 'Notification Image')}
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {t('notificationsPage.optionalLabel', '(Optional)')}
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
                      disabled={isSending}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      title={t('common.remove', 'Remove image')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !isSending && fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (isSending) return;
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-2xs">
                      <UploadCloud size={20} />
                    </div>
                    <div className="text-xs font-semibold text-gray-700">
                      {t('notificationsPage.uploadPrompt', 'Click to upload image or drag and drop')}
                    </div>
                    <p className="text-[11px] text-gray-400">PNG, JPG, WebP, GIF</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSending}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('notificationsPage.sending', 'Sending...')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{t('notificationsPage.sendButton', 'Send Notification')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


