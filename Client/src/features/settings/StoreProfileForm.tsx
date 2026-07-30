import { useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { StoreProfileData } from './types';
import { cn, mapServiceErrorsToForm } from './utils';
import { useUpdateStoreProfile } from './hooks/useUpdateStoreProfile';
import { StorePreviewCard } from './components/StorePreviewCard';
import { StoreLogoUpload } from './components/StoreLogoUpload';
import { StoreBasicInfoSection } from './components/StoreBasicInfoSection';
import { StoreContactInfoSection } from './components/StoreContactInfoSection';

import toast from 'react-hot-toast';

export function StoreProfileForm({
  initialData,
  onSave,
  onSuccess,
}: {
  initialData: StoreProfileData;
  onSave?: (d: StoreProfileData) => Promise<void>;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const updateStoreProfileMutation = useUpdateStoreProfile();

  const methods = useForm<StoreProfileData>({
    values: initialData,
  });

  const onSubmit = (data: StoreProfileData) => {
    startTransition(async () => {
      try {
        await updateStoreProfileMutation.mutateAsync(data);

        if (onSave) {
          await onSave(data);
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Failed to save store profile:', error);
        if (error && typeof error === 'object') {
          console.error('Error JSON details:', JSON.stringify(error, null, 2));
          const axiosErr = (error as any).originalError;
          if (axiosErr && axiosErr.response) {
            console.error('API Response Data:', axiosErr.response.data);
            if (axiosErr.response.data?.error?.validation) {
              console.error(
                'API Validation Details:',
                JSON.stringify(axiosErr.response.data.error.validation, null, 2)
              );
            }
          }
        }

        let validationMsg = '';
        if (error && typeof error === 'object' && 'details' in error) {
          const details = (error as { details: unknown }).details;
          if (Array.isArray(details)) {
            validationMsg = details
              .map((d: unknown) => {
                if (d && typeof d === 'object') {
                  const dObj = d as Record<string, unknown>;
                  const prop = String(dObj.property || dObj.field || 'Error');
                  const msg = String(
                    dObj.message || dObj.msg || JSON.stringify(dObj)
                  );
                  return `${prop}: ${msg}`;
                }
                return String(d);
              })
              .join('; ');
          } else if (details && typeof details === 'object') {
            const detailsObj = details as Record<string, unknown>;
            validationMsg = Object.keys(detailsObj)
              .map((k) => {
                const val = detailsObj[k];
                return `${k}: ${Array.isArray(val) ? val.join(', ') : String(val)}`;
              })
              .join('; ');
          }
        }

        if (validationMsg) {
          toast.error(`Validation Details: ${validationMsg}`, {
            duration: 8000,
          });
        }

        mapServiceErrorsToForm(error, methods.setError, {
          publicPhoneNumber: 'phoneNumber',
          publicEmail: 'publicEmail',
        });
      }
    });
  };

  const isSubmitting = isPending || updateStoreProfileMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <StorePreviewCard />
        <StoreLogoUpload />
        <StoreBasicInfoSection isPending={isSubmitting} />
        <StoreContactInfoSection isPending={isSubmitting} />

        <div className="settings-surface-enter settings-stagger-3 flex justify-center md:justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 w-full md:w-fit ease-out active:scale-95 cursor-pointer',
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-950 hover:bg-gray-800'
            )}
          >
            {isSubmitting ? t('settings.saving') : t('settings.saveChanges')}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
