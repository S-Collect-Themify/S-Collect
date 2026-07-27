import { ImageIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { StoreProfileData } from '../types';

export function StorePreviewCard() {
  const { t } = useTranslation();
  const { watch } = useFormContext<StoreProfileData>();

  const storeName = watch('storeName');
  const storeDescription = watch('storeDescription');
  const publicEmail = watch('publicEmail');
  const phoneNumber = watch('phoneNumber');
  const storeLogoUrl = watch('storeLogoUrl');

  return (
    <div className="settings-surface-enter settings-stagger-1 mb-5">
      <p className="text-xs font-bold text-[#969696] mb-3">
        {t('settings.storePreview')}
      </p>
      <div className="border border-[#E9E9E9] rounded-lg bg-white/50 p-3 md:p-5 transition-all duration-300 ease-out">
        <div className="flex items-center md:items-start gap-3 md:gap-5">
          <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full bg-[#F8F8F8] flex items-center justify-center overflow-hidden">
            {storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={t('settings.logo.alt')}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon
                size={16}
                className="text-[#969696] w-6 h-6 md:w-8 md:h-8"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-[#090909]">
              {storeName || t('settings.storeNameFallback')}
            </p>
            <p className="text-sm font-medium text-[#969696] mt-0.5 line-clamp-1 md:line-clamp-2">
              {storeDescription || t('settings.storeDescriptionFallback')}
            </p>
            <p className="text-xs text-[#969696] mt-1 flex items-center gap-1.5 flex-wrap font-normal">
              {publicEmail && <span>{publicEmail}</span>}
              {publicEmail && phoneNumber && <span>•</span>}
              {phoneNumber && <span>{phoneNumber}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
