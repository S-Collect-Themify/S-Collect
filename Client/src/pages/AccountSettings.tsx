'use client';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';

import { AccountSettingsForm } from '../features/settings/AccountSettingsForm';
import { AccountSettingsFormSkeleton } from '../features/settings/skeleton/SettingsSkeletons';
import { useAccountSettings } from '../features/settings/hooks/useAccountSettings';
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
  const { data: fetchedData, isLoading: loading } = useAccountSettings();

  const accountData: AccountSettingsData = {
    ...defaultAccountSettings,
    ...initialAccountSettings,
    ...fetchedData,
  };

  return (
    <>
      <div className="border-b border-gray-200 sidebar-page-container-header">
        <h1 className="heading-page-title">{t('settings.accountSettings')}</h1>
        <nav aria-label="Breadcrumb" className="py-2 text-sm flex items-center gap-1.5">
          <Link
            to="/settings"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            {t('settings.title', 'Settings')}
          </Link>
          <span className="mx-0.5 text-gray-400 flex items-center rtl:rotate-180 shrink-0">
            <ChevronsRight size={16} />
          </span>
          <span className="text-gray-900 font-semibold" aria-current="page">
            {t('settings.accountSettings', 'Account Settings')}
          </span>
        </nav>
      </div>
      <div className="settings-page-enter min-h-screen bg-gray-100 overflow-x-hidden">
        <div className="settings-surface-enter settings-stagger-1 sidebar-page-container max-w-180 w-full min-w-0">
          {loading ? (
            <AccountSettingsFormSkeleton />
          ) : (
            <AccountSettingsForm
              initialData={accountData}
              onSave={onAccountSettingsSave}
            />
          )}
        </div>
      </div>
    </>
  );
}
