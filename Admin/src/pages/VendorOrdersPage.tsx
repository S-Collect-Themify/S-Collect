import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useVendorStore,
  VendorHeader,
  VendorOrdersLog,
  SuspendVendorModal,
  ActivateVendorModal,
} from '../features/vendors';

export default function VendorOrdersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const vendors = useVendorStore((s) => s.vendors);
  const suspendVendor = useVendorStore((s) => s.suspendVendor);
  const activateVendor = useVendorStore((s) => s.activateVendor);

  const vendorId = id ?? '';
  const vendor = vendors.find((v) => v.id === vendorId);

  const [showSuspend, setShowSuspend] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  if (!vendor) {
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
        activeSubTab="orders"
      />

      <div className="sidebar-page-container pb-8">
        <VendorOrdersLog vendor={vendor} />
      </div>

      <SuspendVendorModal
        isOpen={showSuspend}
        vendorName={vendor.businessName}
        onConfirm={(reason) => {
          suspendVendor(vendor.id, reason);
          setShowSuspend(false);
        }}
        onCancel={() => setShowSuspend(false)}
      />

      <ActivateVendorModal
        isOpen={showActivate}
        vendorName={vendor.businessName}
        onConfirm={() => {
          activateVendor(vendor.id);
          setShowActivate(false);
        }}
        onCancel={() => setShowActivate(false)}
      />
    </div>
  );
}
