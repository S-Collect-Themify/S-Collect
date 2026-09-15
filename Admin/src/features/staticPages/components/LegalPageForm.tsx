import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, Clock } from 'lucide-react';
import { useLegalPageQuery, useUpdateLegalPageMutation } from '../useStaticPagesData';
import { LanguageToggle } from './LanguageToggle';
import type { EditorLanguage, LegalPageContent, LegalPageType } from '../types';

const TITLE_KEYS: Record<LegalPageType, { titleKey: string; defaultTitle: string }> = {
  return: { titleKey: 'staticPages.legal.returnDefaultTitle', defaultTitle: 'Return Policy' },
  terms: { titleKey: 'staticPages.legal.termsDefaultTitle', defaultTitle: 'Terms & Conditions' },
  privacy: { titleKey: 'staticPages.legal.privacyDefaultTitle', defaultTitle: 'Privacy Policy' },
};

interface LegalPageFormProps {
  type: LegalPageType;
}

/** Reusable editor for the three long-form legal pages: Return Policy, Terms & Conditions, Privacy Policy. */
export const LegalPageForm = ({ type }: LegalPageFormProps) => {
  const { t, i18n } = useTranslation();
  const { data: page, isLoading } = useLegalPageQuery(type);
  const updateMutation = useUpdateLegalPageMutation();
  const [editorLang, setEditorLang] = useState<EditorLanguage>('en');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<LegalPageContent>({
    defaultValues: page,
  });

  useEffect(() => {
    if (page) reset(page);
  }, [page, reset]);

  const onSubmit = (values: LegalPageContent) => {
    updateMutation.mutate(
      { type, title: values.title, body: values.body },
      { onSuccess: (saved) => reset(saved) }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-10 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  const { titleKey, defaultTitle } = TITLE_KEYS[type];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t(titleKey, defaultTitle)}</h3>
            {page?.updatedAt && (
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <Clock size={12} />
                {t('staticPages.legal.lastUpdated', 'Last updated')}:{' '}
                {new Date(page.updatedAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
              </p>
            )}
          </div>
          <LanguageToggle value={editorLang} onChange={setEditorLang} />
        </div>

        <div className={editorLang === 'en' ? 'space-y-4' : 'hidden'}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.legal.pageTitleEn', 'Page Title (English)')}
            </label>
            <input
              type="text"
              dir="ltr"
              {...register('title.en')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.legal.pageBodyEn', 'Page Content (English)')}
            </label>
            <textarea
              rows={16}
              dir="ltr"
              placeholder={t(
                'staticPages.legal.bodyPlaceholder',
                'Write the page content here. Separate paragraphs with a blank line.'
              )}
              {...register('body.en')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        <div className={editorLang === 'ar' ? 'space-y-4' : 'hidden'}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.legal.pageTitleAr', 'Page Title (Arabic)')}
            </label>
            <input
              type="text"
              dir="rtl"
              {...register('title.ar')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.legal.pageBodyAr', 'Page Content (Arabic)')}
            </label>
            <textarea
              rows={16}
              dir="rtl"
              placeholder={t(
                'staticPages.legal.bodyPlaceholder',
                'Write the page content here. Separate paragraphs with a blank line.'
              )}
              {...register('body.ar')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isDirty || updateMutation.isPending}
          className={`font-semibold text-sm px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2 ${
            !isDirty || updateMutation.isPending
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
              : 'bg-black hover:bg-gray-800 text-white cursor-pointer shadow-xs'
          }`}
        >
          {updateMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {t('staticPages.legal.save', 'Save Page')}
        </button>
      </div>
    </form>
  );
};
