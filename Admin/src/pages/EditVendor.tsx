import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useVendorRawDetails,
  useUpdateVendor,
} from '../features/vendors/hooks/useVendors';
import VendorForm from '../features/vendors/components/VendorForm';
import {
  buildVendorPayload,
  rawToVendorForm,
  type VendorFormValues,
} from '../features/vendors/utils/vendorFormUtils';

export default function EditVendor() {
  const { id } = useParams<{ id: string }>();
  const vendorId = id ?? '';
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { data: raw, isLoading, isError } = useVendorRawDetails(vendorId);
  const updateMutation = useUpdateVendor();

  // Derive form values from the loaded vendor, re-computed only when `raw` changes.
  const [initialValues, setInitialValues] = useState<VendorFormValues | undefined>(
    undefined
  );
  const [syncedFrom, setSyncedFrom] = useState<unknown>(null);
  if (raw && raw !== syncedFrom) {
    setSyncedFrom(raw);
    setInitialValues(rawToVendorForm(raw));
  }

  const handleSubmit = (values: VendorFormValues) => {
    if (!vendorId) return;
    const payload = buildVendorPayload(values);
    updateMutation.mutate(
      { id: vendorId, payload },
      { onSuccess: () => navigate(`/vendors/${vendorId}`) }
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
            {t('vendors.edit.title', 'Edit Vendor')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/vendors" className="hover:text-gray-600 transition-colors">
              {t('vendors.details.breadcrumbParent', 'Vendor Management')}
            </Link>
            <ChevronRight
              size={12}
              className={`text-gray-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`}
            />
            <Link
              to={`/vendors/${vendorId}`}
              className="hover:text-gray-600 transition-colors"
            >
              {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
            </Link>
            <ChevronRight
              size={12}
              className={`text-gray-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`}
            />
            <span className="text-gray-900 font-medium">
              {t('vendors.edit.title', 'Edit Vendor')}
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
              {t('vendors.edit.loading', 'Loading vendor data...')}
            </span>
          </div>
        ) : isError || !raw ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500">
              {t('vendors.details.vendorNotFound', 'Vendor not found')}
            </p>
            <button
              onClick={() => navigate('/vendors')}
              className="text-sm underline text-gray-600 cursor-pointer"
            >
              {t('vendors.details.backToVendors', 'Back to Vendors')}
            </button>
          </div>
        ) : (
          <VendorForm
            mode="edit"
            initialValues={initialValues}
            submitting={updateMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/vendors/${vendorId}`)}
          />
        )}
      </div>
    </>
  );
}
