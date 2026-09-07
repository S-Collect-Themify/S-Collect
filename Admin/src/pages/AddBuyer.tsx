import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateBuyer } from '../features/buyers/hooks/useBuyers';
import BuyerForm from '../features/buyers/components/BuyerForm';
import {
  buildBuyerPayload,
  type BuyerFormValues,
} from '../features/buyers/utils/buyerFormUtils';

export default function AddBuyer() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const createMutation = useCreateBuyer();

  const handleSubmit = (values: BuyerFormValues) => {
    const payload = buildBuyerPayload(values, { includePassword: true });
    createMutation.mutate(payload, {
      onSuccess: () => navigate('/buyers'),
    });
  };

  return (
    <>
      {/* Header */}
      <div
        className="sidebar-page-container-header border-b border-gray-100/80 flex justify-between items-center py-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('buyers.add.title', 'Add Buyer')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/buyers" className="hover:text-gray-600 transition-colors">
              {t('buyers.edit.breadcrumbParent', 'Buyers')}
            </Link>
            <ChevronRight
              size={12}
              className={`text-gray-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`}
            />
            <span className="text-gray-900 font-medium">
              {t('buyers.add.title', 'Add Buyer')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto pt-6 pb-10 sidebar-page-container"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <BuyerForm
          mode="create"
          submitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/buyers')}
        />
      </div>
    </>
  );
}
