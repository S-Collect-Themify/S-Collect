import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import {
  VoucherHeader,
  VoucherForm,
  useVouchersData,
  useSingleVoucherQuery,
  type VoucherFormData,
} from '../features/vouchers';
import type { VoucherApiData } from '../services/vouchers';

const CreateVoucher = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const { createMutation, updateMutation } = useVouchersData();
  const voucherQuery = useSingleVoucherQuery(id);

  const isEditing = Boolean(id);
  const existingVoucher = voucherQuery.data;

  const handleSubmit = (formData: VoucherFormData) => {
    const isCategory =
      formData.scope === 'SPECIFIC_CATEGORIES' || formData.scope === 'Category';
    const isFixed =
      formData.type === 'FIXED_AMOUNT' || formData.type === 'Amount';

    const payload: VoucherApiData = {
      code: formData.code.trim(),
      category: formData.category,
      categoryIds: formData.category,
      scope: isCategory ? 'SPECIFIC_CATEGORIES' : 'ALL_ORDERS',
      type: isFixed ? 'FIXED_AMOUNT' : 'PERCENTAGE',
      value: Number(formData.discountValue || 0),
      discountValue: formData.discountValue,
      minOrderAmount: formData.minOrder ? Number(formData.minOrder) : undefined,
      minOrder: formData.minOrder,
      maxDiscountAmount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      maxDiscount: formData.maxDiscount,
      expiryDate: formData.expiryDate,
      maxTotalUses: formData.maxUsage ? Number(formData.maxUsage) : undefined,
      maxUsage: formData.maxUsage,
      limitOnePerCustomer: formData.limitOnePerCustomer,
      oneUsePerUser: formData.limitOnePerCustomer,
      startsAt: new Date().toISOString(),
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
        {isEditing && voucherQuery.isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-600" />
            <span className="text-sm font-medium">
              {i18n.language === 'ar' ? 'جاري تحميل بيانات القسيمة...' : 'Loading voucher details...'}
            </span>
          </div>
        ) : (
          <VoucherForm
            initialVoucher={existingVoucher}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </div>
    </>
  );
};

export default CreateVoucher;
