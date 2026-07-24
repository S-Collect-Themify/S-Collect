import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { StoreProfileForm } from '../StoreProfileForm';
import { StoreProfileFormSkeleton } from '../skeleton/SettingsSkeletons';
import {
  useStoreProfile,
  STORE_PROFILE_QUERY_KEY,
} from '../hooks/useStoreProfile';
import type { StoreProfileData } from '../types';

export function StoreDetailsTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useStoreProfile();

  const handleSave = async (data: StoreProfileData) => {
    queryClient.setQueryData(STORE_PROFILE_QUERY_KEY, data);
  };

  if (isLoading || !data) {
    return <StoreProfileFormSkeleton />;
  }

  return (
    <StoreProfileForm
      initialData={data}
      onSave={handleSave}
      onSuccess={() => onToast(t('settings.toast.storeProfileSaved'))}
    />
  );
}
