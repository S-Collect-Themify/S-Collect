import { useTranslation } from 'react-i18next';
import BankSettings from '../BankSettings';
import { useBankInfo } from '../hooks/useBankInfo';
import { useUpdateBankInfo } from '../hooks/useUpdateBankInfo';
import { BankAccountFormSkeleton } from '../skeleton/SettingsSkeletons';
import type { BankAccountFormValues } from '../BankSettings';

export function BankAccountTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useBankInfo();
  const updateBankInfoMutation = useUpdateBankInfo();

  const handleSave = async (values: BankAccountFormValues) => {
    await updateBankInfoMutation.mutateAsync(values);
    onToast(t('settings.toast.bankAccountSaved'));
  };

  if (isLoading) {
    return <BankAccountFormSkeleton />;
  }

  return (
    <BankSettings
      defaultValues={data}
      onSave={handleSave}
      isPending={updateBankInfoMutation.isPending}
    />
  );
}
