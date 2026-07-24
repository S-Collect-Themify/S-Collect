'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsRight } from 'lucide-react';

import { SuccessToast } from '../features/settings/shared';
import {
  SettingsTabs,
  type SettingsTab,
} from '../features/settings/components/SettingsTabs';
import { StoreDetailsTab } from '../features/settings/components/StoreDetailsTab';
import { BankAccountTab } from '../features/settings/components/BankAccountTab';
import { ShippingTab } from '../features/settings/components/ShippingTab';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SettingsTab>('store-details');
  const [toast, setToast] = useState<string | null>(null);

  const breadcrumb =
    tab === 'store-details'
      ? t('settings.storeProfile')
      : tab === 'bank-account'
        ? t('settings.bankAccount')
        : t('settings.shipping');

  return (
    <>
      <div className="bg-white border-b border-gray-200 sidebar-page-container-header">
        <h1 className="heading-page-title">{t('settings.title')}</h1>
        <nav className="mt-3 text-sm flex items-center gap-1">
          <span className="text-[#090909]">{t('settings.title')}</span>
          <span className="mx-0.5 text-[#737373]">
            <ChevronsRight size={16} />
          </span>
          <span className="text-[#737373]">{breadcrumb}</span>
        </nav>
      </div>
      <div className="settings-page-enter min-h-screen bg-gray-100">
        {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}

        <div className="settings-surface-enter settings-stagger-1 p-2 md:p-4 md:px-8 md:py-7 max-w-180">
          <SettingsTabs tab={tab} onChange={setTab} />

          <div key={tab} className="settings-surface-enter">
            {tab === 'store-details' && <StoreDetailsTab onToast={setToast} />}
            {tab === 'bank-account' && <BankAccountTab onToast={setToast} />}
            {tab === 'shipping' && <ShippingTab />}
          </div>
        </div>
      </div>
    </>
  );
}
