import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Loader2, Save } from 'lucide-react';
import { useContactUsQuery, useUpdateContactUsMutation } from '../useStaticPagesData';
import { LanguageToggle } from './LanguageToggle';
import type { ContactUsContent, EditorLanguage } from '../types';

export const ContactUsForm = () => {
  const { t } = useTranslation();
  const { data: contactUs, isLoading } = useContactUsQuery();
  const updateMutation = useUpdateContactUsMutation();
  const [editorLang, setEditorLang] = useState<EditorLanguage>('en');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ContactUsContent>({
    defaultValues: contactUs,
  });

  useEffect(() => {
    if (contactUs) reset(contactUs);
  }, [contactUs, reset]);

  const onSubmit = (values: ContactUsContent) => {
    updateMutation.mutate(values, {
      onSuccess: (saved) => reset(saved),
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-10 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Direct contact details */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('staticPages.contact.directDetails', 'Direct Contact Details')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.email', 'Support Email')}
            </label>
            <input
              type="email"
              placeholder="support@example.com"
              {...register('email')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.phone', 'Phone Number')}
            </label>
            <input
              type="tel"
              placeholder="+966 5xxxxxxxx"
              {...register('phone')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.whatsapp', 'WhatsApp Number')}
            </label>
            <input
              type="tel"
              placeholder="+966 5xxxxxxxx"
              {...register('whatsapp')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Address & working hours (bilingual) */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {t('staticPages.contact.addressAndHours', 'Address & Working Hours')}
          </h3>
          <LanguageToggle value={editorLang} onChange={setEditorLang} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={editorLang === 'en' ? 'block' : 'hidden'}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.addressEn', 'Address (English)')}
            </label>
            <textarea
              rows={3}
              dir="ltr"
              {...register('address.en')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className={editorLang === 'ar' ? 'block' : 'hidden'}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.addressAr', 'Address (Arabic)')}
            </label>
            <textarea
              rows={3}
              dir="rtl"
              {...register('address.ar')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className={editorLang === 'en' ? 'block' : 'hidden'}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.workingHoursEn', 'Working Hours (English)')}
            </label>
            <textarea
              rows={3}
              dir="ltr"
              placeholder="Sat - Thu: 9:00 AM - 6:00 PM"
              {...register('workingHours.en')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className={editorLang === 'ar' ? 'block' : 'hidden'}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.workingHoursAr', 'Working Hours (Arabic)')}
            </label>
            <textarea
              rows={3}
              dir="rtl"
              {...register('workingHours.ar')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Social media links */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('staticPages.contact.socialLinks', 'Social Media Links')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.facebook', 'Facebook URL')}
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/your-page"
              dir="ltr"
              {...register('socialLinks.facebook')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.instagram', 'Instagram URL')}
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/your-page"
              dir="ltr"
              {...register('socialLinks.instagram')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.x', 'X (Twitter) URL')}
            </label>
            <input
              type="url"
              placeholder="https://x.com/your-page"
              dir="ltr"
              {...register('socialLinks.x')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t('staticPages.contact.tiktok', 'TikTok URL')}
            </label>
            <input
              type="url"
              placeholder="https://tiktok.com/@your-page"
              dir="ltr"
              {...register('socialLinks.tiktok')}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('staticPages.contact.mapUrl', 'Google Maps Embed / Link')}
        </h3>
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          dir="ltr"
          {...register('mapUrl')}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {/* Save */}
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
          {t('staticPages.contact.save', 'Save Contact Info')}
        </button>
      </div>
    </form>
  );
};
