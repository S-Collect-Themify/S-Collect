import { useTranslation } from 'react-i18next';

import { StoreProfileForm } from '../StoreProfileForm';
import { StoreProfileFormSkeleton } from '../skeleton/SettingsSkeletons';
import { useStoreProfile } from '../hooks/useStoreProfile';

export function StoreDetailsTab() {
  const { data, isLoading } = useStoreProfile();

  const handleSave = async () => {
    // Cache invalidation is handled by the mutation hook automatically on success
  };

  if (isLoading || !data) {
    return <StoreProfileFormSkeleton />;
  }

  return <StoreProfileForm initialData={data} onSave={handleSave} />;
}
