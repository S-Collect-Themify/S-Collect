'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsRight } from 'lucide-react';

import { AccountSettingsForm } from '../features/settings/AccountSettingsForm';
import { AccountSettingsFormSkeleton } from '../features/settings/skeleton/SettingsSkeletons';
import { useAccountSettings } from '../features/settings/hooks/useAccountSettings';
import { SuccessToast } from '../features/settings/shared';
import type {
  AccountSettingsData,
  PasswordData,
} from '../features/settings/types';

interface AccountSettingsPageProps {
  initialAccountSettings?: Partial<AccountSettingsData>;
  onAccountSettingsSave?: (
    data: AccountSettingsData & PasswordData
  ) => Promise<void>;
}

const defaultAccountSettings: AccountSettingsData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
};

export default function AccountSettingsPage({
  initialAccountSettings,
  onAccountSettingsSave = async () => undefined,
}: AccountSettingsPageProps) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<string | null>(null);
  const { data: fetchedData, isLoading: loading } = useAccountSettings();

  const accountData: AccountSettingsData = {
    ...defaultAccountSettings,
    ...initialAccountSettings,
    ...fetchedData,
  };

  return (
    <>
      <div className="border-b border-gray-200 sidebar-page-container-header">
        <h1 className="heading-page-title">
          {t('settings.accountSettings')}
        </h1>
        <nav className="mt-3 text-sm flex items-center gap-1">
          <span className="text-[#090909]">{t('settings.accountSettings')}</span>
          <span className="mx-0.5 text-[#737373]">
            <ChevronsRight size={16} />
          </span>
          <span className="text-[#737373]">
            {t('settings.account.personalInformation')}
          </span>
        </nav>
      </div>
      <div className="settings-page-enter min-h-screen bg-gray-100">
        {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}

        <div className="settings-surface-enter settings-stagger-1 sidebar-page-container max-w-180">
          {loading ? (
            <AccountSettingsFormSkeleton />
          ) : (
            <AccountSettingsForm
              initialData={accountData}
              onSave={onAccountSettingsSave}
              onSuccess={() =>
                setToast(t('settings.toast.accountSettingsSaved'))
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
