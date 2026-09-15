import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Bilingual, FaqCategory } from '../types';

interface FaqCategoryFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  category?: FaqCategory | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (name: Bilingual) => void;
}

export const FaqCategoryFormModal = ({
  isOpen,
  mode,
  category,
  isPending = false,
  onClose,
  onSubmit,
}: FaqCategoryFormModalProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Bilingual>({ defaultValues: { en: '', ar: '' } });

  useEffect(() => {
    if (isOpen) {
      reset({ en: category?.name.en || '', ar: category?.name.ar || '' });
    }
  }, [isOpen, category, reset]);

  const submit = (values: Bilingual) => {
    onSubmit({ en: values.en.trim(), ar: values.ar.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-2xs">
                  <FolderPlus size={18} />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {mode === 'add'
                    ? t('staticPages.faq.addCategoryTitle', 'Add FAQ Category')
                    : t('staticPages.faq.editCategoryTitle', 'Edit FAQ Category')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(submit)} className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.categoryNameEn', 'Category Name (English)')}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shipping"
                  {...register('en', { required: t('common.required', 'This field is required') })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.en && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.en.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.categoryNameAr', 'Category Name (Arabic)')}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: الشحن"
                  {...register('ar', { required: t('common.required', 'This field is required') })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.ar && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.ar.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>
                    {mode === 'add'
                      ? t('staticPages.faq.addCategoryButton', 'Add Category')
                      : t('staticPages.faq.saveCategoryButton', 'Save Changes')}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
