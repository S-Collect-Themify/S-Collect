import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  VoucherHeader,
  VoucherForm,
  useVoucherStore,
  useVouchersData,
  type VoucherFormData,
} from '../features/vouchers';
import type { VoucherApiData } from '../services/vouchers';

const CreateVoucher = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const vouchers = useVoucherStore((s) => s.vouchers);
  const { createMutation, updateMutation } = useVouchersData();

  const isEditing = Boolean(id);

  const existingVoucher = useMemo(() => {
    if (!id) return null;
    return vouchers.find((v) => v.id === id || v.code === id) || null;
  }, [id, vouchers]);

  const handleSubmit = (formData: VoucherFormData) => {
    const payload: VoucherApiData = {
      code: formData.code,
      type: formData.type,
      discountValue: formData.discountValue,
      minOrder: formData.minOrder,
      maxDiscount: formData.maxDiscount,
      expiryDate: formData.expiryDate,
      maxUsage: formData.maxUsage,
      limitOnePerCustomer: formData.limitOnePerCustomer,
    };

    if (isEditing && id) {
      updateMutation.mutate(
        { id, payload },
        {
          onSuccess: () => navigate('/vouchers'),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/vouchers'),
      });
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="sidebar-page-container-header">
        <VoucherHeader
          titleKey={
            isEditing
              ? 'vouchersListing.editTitle'
              : 'vouchersListing.createTitle'
          }
          breadcrumbType={isEditing ? 'edit' : 'create'}
          showCreateButton={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 sidebar-page-container transition-all">
        <VoucherForm
          initialVoucher={existingVoucher}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </>
  );
};

export default CreateVoucher;
