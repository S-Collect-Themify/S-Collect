import { useTranslation } from 'react-i18next';
import BankSettings, { type BankAccountFormValues } from '../BankSettings';
import { useUpdateBankInfo } from '../hooks/useUpdateBankInfo';

export function BankAccountTab({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const { t } = useTranslation();
  const updateBankInfoMutation = useUpdateBankInfo();

  const handleSave = async (values: BankAccountFormValues) => {
    await updateBankInfoMutation.mutateAsync({
      bankName: values.bankName,
      iban: values.iban,
      accountHolderName: values.accountHolderName,
    });
    onToast(t('settings.toast.bankAccountSaved'));
  };

  return (
    <BankSettings
      onSave={handleSave}
      isSubmitting={updateBankInfoMutation.isPending}
    />
  );
}
