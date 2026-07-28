import RejectVendorModal from '../modals/RejectVendorModal';
import VendorConfirmModal from '../modals/VendorConfirmModal';
import { useVendorDetailsStore } from '../store/useVendorDetailsStore';
import {
  useDeactivateVendor,
  useReactivateVendor,
  useApproveVendor,
  useRejectVendor,
} from '../hooks/useVendors';

interface VendorDetailsModalsProps {
  vendorId: string;
  vendorName: string;
}

export default function VendorDetailsModals({
  vendorId,
  vendorName,
}: VendorDetailsModalsProps) {
  const {
    showSuspend,
    showActivate,
    showReject,
    showApprove,
    closeSuspend,
    closeActivate,
    closeReject,
    closeApprove,
  } = useVendorDetailsStore();

  const approveMutation = useApproveVendor();
  const rejectMutation = useRejectVendor();
  const deactivateMutation = useDeactivateVendor();
  const reactivateMutation = useReactivateVendor();

  const handleSuspendConfirm = () => {
    deactivateMutation.mutate(vendorId);
    closeSuspend();
  };

  const handleActivateConfirm = () => {
    reactivateMutation.mutate(vendorId);
    closeActivate();
  };

  const handleRejectConfirm = (reason: string) => {
    rejectMutation.mutate({ id: vendorId, reason });
    closeReject();
  };

  const handleApproveConfirm = () => {
    approveMutation.mutate(vendorId);
    closeApprove();
  };

  return (
    <>
      <VendorConfirmModal
        isOpen={showSuspend}
        type="deactivate"
        count={1}
        vendorName={vendorName}
        onConfirm={handleSuspendConfirm}
        onCancel={closeSuspend}
      />

      <VendorConfirmModal
        isOpen={showActivate}
        type="reactivate"
        count={1}
        vendorName={vendorName}
        onConfirm={handleActivateConfirm}
        onCancel={closeActivate}
      />

      <RejectVendorModal
        isOpen={showReject}
        vendorName={vendorName}
        onConfirm={handleRejectConfirm}
        onCancel={closeReject}
      />

      <VendorConfirmModal
        isOpen={showApprove}
        type="approve"
        count={1}
        vendorName={vendorName}
        onConfirm={handleApproveConfirm}
        onCancel={closeApprove}
      />
    </>
  );
}
