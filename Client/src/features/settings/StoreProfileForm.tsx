import { useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { StoreProfileData } from './types';
import { cn } from './utils';
import { useUpdateStoreProfile } from './hooks/useUpdateStoreProfile';
import { StorePreviewCard } from './components/StorePreviewCard';
import { StoreLogoUpload } from './components/StoreLogoUpload';
import { StoreBasicInfoSection } from './components/StoreBasicInfoSection';
import { StoreContactInfoSection } from './components/StoreContactInfoSection';

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
      } catch (err) {
        console.error('Failed to save store profile:', err);
      }
    });
  };

  const hasErrors = Object.keys(methods.formState.errors).length > 0;
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
            disabled={hasErrors || isSubmitting}
            className={cn(
              'py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 w-full md:w-fit ease-out active:scale-95 cursor-pointer',
              hasErrors || isSubmitting
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
