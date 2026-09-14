import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateVendor } from '../features/vendors/hooks/useVendors';
import VendorForm from '../features/vendors/components/VendorForm';
import {
  buildVendorPayload,
  type VendorFormValues,
} from '../features/vendors/utils/vendorFormUtils';

export default function AddVendor() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const createMutation = useCreateVendor();

  const handleSubmit = (values: VendorFormValues) => {
    const payload = buildVendorPayload(values, { includePassword: true });
    createMutation.mutate(payload, {
      onSuccess: () => navigate('/vendors'),
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
            {t('vendors.add.title', 'Add Vendor')}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link to="/vendors" className="hover:text-gray-600 transition-colors">
              {t('vendors.details.breadcrumbParent', 'Vendor Management')}
            </Link>
            <ChevronRight
              size={12}
              className={`text-gray-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`}
            />
            <span className="text-gray-900 font-medium">
              {t('vendors.add.title', 'Add Vendor')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto pt-6 pb-10 sidebar-page-container"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <VendorForm
          mode="create"
          submitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/vendors')}
        />
      </div>
    </>
  );
}
