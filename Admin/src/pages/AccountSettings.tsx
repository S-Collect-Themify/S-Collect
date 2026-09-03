'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsRight } from 'lucide-react';

import { AccountSettingsForm } from '../features/settings/AccountSettingsForm';
import { SuccessToast } from '../features/settings/shared';
import type { AccountSettingsData } from '../features/settings/types';

interface AccountSettingsPageProps {
  initialAccountSettings?: Partial<AccountSettingsData>;
  onAccountSettingsSave?: (data: AccountSettingsData) => Promise<void>;
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

  const accountData = useMemo(
    () => ({
      ...defaultAccountSettings,
      ...initialAccountSettings,
    }),
    [initialAccountSettings]
  );

  return (
    <div className="settings-page-enter flex-1 bg-gray-100">
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}

      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-3">
        <h1 className="text-2xl font-semibold text-[#090909]">
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

      <div className="settings-surface-enter settings-stagger-1 p-2 md:p-4 md:px-8 md:py-7 max-w-180">
        <AccountSettingsForm
          initialData={accountData}
          onSave={onAccountSettingsSave}
          onSuccess={() =>
            setToast(t('settings.toast.accountSettingsSaved'))
          }
        />
      </div>
    </div>
  );
}
