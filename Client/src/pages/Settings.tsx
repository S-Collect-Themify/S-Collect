'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';

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
        <nav aria-label="Breadcrumb" className="py-2 text-sm flex items-center gap-1.5">
          <Link
            to="/settings"
            onClick={() => setTab('store-details')}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            {t('settings.title')}
          </Link>
          <span className="mx-0.5 text-gray-400 flex items-center rtl:rotate-180 shrink-0">
            <ChevronsRight size={16} />
          </span>
          <span className="text-gray-900 font-semibold" aria-current="page">{breadcrumb}</span>
        </nav>
      </div>
      <div className="settings-page-enter min-h-screen bg-gray-100 overflow-x-hidden">
        <div className="settings-surface-enter settings-stagger-1 p-2 md:p-4 md:px-8 md:py-7 max-w-180 w-full min-w-0">
          <SettingsTabs tab={tab} onChange={setTab} />

          <div key={tab} className="settings-surface-enter w-full min-w-0">
            {tab === 'store-details' && <StoreDetailsTab />}
            {tab === 'bank-account' && <BankAccountTab />}
            {tab === 'shipping' && <ShippingTab />}
          </div>
        </div>
      </div>
    </>
  );
}
