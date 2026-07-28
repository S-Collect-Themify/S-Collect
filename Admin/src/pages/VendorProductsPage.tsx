import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useVendorDetails,
  useDeactivateVendor,
  useReactivateVendor,
} from '../features/vendors/hooks/useVendors';
import VendorHeader from '../features/vendors/components/VendorHeader';
import VendorProductsLog from '../features/vendors/components/VendorProductsLog';
import VendorConfirmModal from '../features/vendors/modals/VendorConfirmModal';

export default function VendorProductsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const vendorId = id ?? '';
  const { data: vendor, isLoading, isError } = useVendorDetails(vendorId);

  const deactivateMutation = useDeactivateVendor();
  const reactivateMutation = useReactivateVendor();

  const [showSuspend, setShowSuspend] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{t('vendors.details.loading', 'Loading vendor details...')}</p>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('vendors.details.vendorNotFound', 'Vendor not found.')}</p>
        <button
          onClick={() => navigate('/vendors')}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          {t('vendors.details.backToVendors', 'Back to Vendors')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/80 min-h-screen">
      <VendorHeader
        vendor={vendor}
        onSuspend={() => setShowSuspend(true)}
        onActivate={() => setShowActivate(true)}
        activeSubTab="products"
      />

      <div className="sidebar-page-container pb-8">
        <VendorProductsLog vendor={vendor} />
      </div>

      <VendorConfirmModal
        isOpen={showSuspend}
        type="deactivate"
        count={1}
        vendorName={vendor.businessName}
        onConfirm={() => {
          deactivateMutation.mutate(vendor.id);
          setShowSuspend(false);
        }}
        onCancel={() => setShowSuspend(false)}
      />

      <VendorConfirmModal
        isOpen={showActivate}
        type="reactivate"
        count={1}
        vendorName={vendor.businessName}
        onConfirm={() => {
          reactivateMutation.mutate(vendor.id);
          setShowActivate(false);
        }}
        onCancel={() => setShowActivate(false)}
      />
    </div>
  );
}
