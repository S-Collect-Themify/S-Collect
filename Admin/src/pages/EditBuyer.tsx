import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useAdminBuyerRawDetail,
  useUpdateBuyer,
} from '../features/buyers/hooks/useBuyers';
import BuyerForm from '../features/buyers/components/BuyerForm';
import {
  buildBuyerPayload,
  rawToBuyerForm,
  type BuyerFormValues,
} from '../features/buyers/utils/buyerFormUtils';

export default function EditBuyer() {
  const { id } = useParams<{ id: string }>();
  const buyerId = id ?? '';
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: raw, isLoading, isError } = useAdminBuyerRawDetail(buyerId);
  const updateMutation = useUpdateBuyer();

  const [initialValues, setInitialValues] = useState<BuyerFormValues | undefined>(
    undefined
  );
  const [syncedFrom, setSyncedFrom] = useState<unknown>(null);
  if (raw && raw !== syncedFrom) {
    setSyncedFrom(raw);
    setInitialValues(rawToBuyerForm(raw));
  }

  const handleSubmit = (values: BuyerFormValues) => {
    if (!buyerId) return;
    const payload = buildBuyerPayload(values);
    updateMutation.mutate(
      { id: buyerId, payload },
      { onSuccess: () => navigate(`/buyers/${buyerId}`) }
    );
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
            {t('buyers.edit.title', 'Edit Buyer')}
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
              {t('buyers.edit.title', 'Edit Buyer')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto pt-6 pb-10 sidebar-page-container"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-600" />
            <span className="text-sm font-medium">
              {t('buyers.edit.loading', 'Loading buyer data...')}
            </span>
          </div>
        ) : isError || !raw ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500">
              {t('buyers.edit.notFound', 'Buyer not found')}
            </p>
            <button
              onClick={() => navigate('/buyers')}
              className="text-sm underline text-gray-600 cursor-pointer"
            >
              {t('buyers.edit.back', 'Back to Buyers')}
            </button>
          </div>
        ) : (
          <BuyerForm
            mode="edit"
            initialValues={initialValues}
            submitting={updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/buyers/${buyerId}`)}
          />
        )}
      </div>
    </>
  );
}
