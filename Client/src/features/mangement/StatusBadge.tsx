import { useTranslation } from 'react-i18next';
import { STATUS_BADGE } from './constant';
import type { ProductStatus } from './mangement';

type Props = {
  status: ProductStatus;
};

export default function StatusBadge({ status }: Props) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {t(`managementTable.statuses.${status}`, status)}
    </span>
  );
}
