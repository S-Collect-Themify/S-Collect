import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Bilingual, FaqItem } from '../types';

interface FaqItemFormValues {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

interface FaqItemFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  item?: FaqItem | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (payload: { question: Bilingual; answer: Bilingual }) => void;
}

export const FaqItemFormModal = ({
  isOpen,
  mode,
  item,
  isPending = false,
  onClose,
  onSubmit,
}: FaqItemFormModalProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqItemFormValues>({
    defaultValues: { questionEn: '', questionAr: '', answerEn: '', answerAr: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        questionEn: item?.question.en || '',
        questionAr: item?.question.ar || '',
        answerEn: item?.answer.en || '',
        answerAr: item?.answer.ar || '',
      });
    }
  }, [isOpen, item, reset]);

  const submit = (values: FaqItemFormValues) => {
    onSubmit({
      question: { en: values.questionEn.trim(), ar: values.questionAr.trim() },
      answer: { en: values.answerEn.trim(), ar: values.answerAr.trim() },
    });
  };

  const required = t('common.required', 'This field is required');

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
            className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-10 my-8"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-2xs">
                  <HelpCircle size={18} />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {mode === 'add'
                    ? t('staticPages.faq.addItemTitle', 'Add Question')
                    : t('staticPages.faq.editItemTitle', 'Edit Question')}
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

            <form onSubmit={handleSubmit(submit)} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.questionEn', 'Question (English)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('questionEn', { required })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.questionEn && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.questionEn.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.questionAr', 'Question (Arabic)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  {...register('questionAr', { required })}
                  className="w-full h-10 px-3.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                {errors.questionAr && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.questionAr.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.answerEn', 'Answer (English)')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  {...register('answerEn', { required })}
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                />
                {errors.answerEn && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.answerEn.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('staticPages.faq.answerAr', 'Answer (Arabic)')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  {...register('answerAr', { required })}
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                />
                {errors.answerAr && <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.answerAr.message}</p>}
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
                      ? t('staticPages.faq.addItemButton', 'Add Question')
                      : t('staticPages.faq.saveItemButton', 'Save Changes')}
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
