import { useTranslation } from 'react-i18next';

import BankSettings from '../BankSettings';

export function BankAccountTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const { t } = useTranslation();

  return <BankSettings onSave={() => onToast(t('settings.toast.bankAccountSaved'))} />;
}
