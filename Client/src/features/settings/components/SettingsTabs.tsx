import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '../utils';

export type SettingsTab = 'store-details' | 'bank-account' | 'shipping';

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'py-2.5 px-6 w-full md:w-fit rounded-lg text-xs whitespace-nowrap md:text-sm font-semibold transition-all duration-300 ease-out active:scale-95 cursor-pointer',
        active ? 'bg-gray-950 text-white' : 'bg-transparent text-[#545454]'
      )}
    >
      {children}
    </button>
  );
}

export function SettingsTabs({
  tab,
  onChange,
}: {
  tab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex mb-4 md:mb-6 justify-center py-1.5 px-2 w-full md:w-fit bg-[#E9E9E9] rounded-lg transition-all duration-300 ease-out"
      role="tablist"
    >
      <TabBtn active={tab === 'store-details'} onClick={() => onChange('store-details')}>
        {t('settings.storeProfile')}
      </TabBtn>
      <TabBtn active={tab === 'bank-account'} onClick={() => onChange('bank-account')}>
        {t('settings.bankAccount')}
      </TabBtn>
      <TabBtn active={tab === 'shipping'} onClick={() => onChange('shipping')}>
        {t('settings.shipping')}
      </TabBtn>
    </div>
  );
}
