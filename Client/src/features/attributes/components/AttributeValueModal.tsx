import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Tag } from 'lucide-react';
import type {
  VendorAttribute,
  VendorAttributeValue,
  CreateVendorAttributeValueDto,
  UpdateVendorAttributeValueDto,
} from '../types';

interface AttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: VendorAttribute | null;
  value?: VendorAttributeValue | null;
  onSubmit: (
    data: CreateVendorAttributeValueDto | UpdateVendorAttributeValueDto
  ) => Promise<void>;
  isSubmitting?: boolean;
}

interface ValueFormValues {
  value: string;
  valueAr: string;
  sortOrder: number;
}

export const AttributeValueModal = ({
  isOpen,
  onClose,
  attribute,
  value,
  onSubmit,
  isSubmitting = false,
}: AttributeValueModalProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isEdit = Boolean(value);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValueFormValues>({
    defaultValues: {
      value: '',
      valueAr: '',
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (value) {
        reset({
          value: value.value || '',
          valueAr: value.valueAr || '',
          sortOrder: value.sortOrder ?? 0,
        });
      } else {
        const nextSort = (attribute?.values?.length ?? 0) + 1;
        reset({
          value: '',
          valueAr: '',
          sortOrder: nextSort,
        });
      }
    }
  }, [isOpen, value, attribute, reset]);

  if (!isOpen || !attribute) return null;

  const attributeDisplayName = isArabic
    ? attribute.nameAr || attribute.name
    : attribute.name;

  const handleFormSubmit = async (values: ValueFormValues) => {
    if (isEdit) {
      const updateDto: UpdateVendorAttributeValueDto = {
        value: values.value.trim(),
        valueAr: values.valueAr.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };
      await onSubmit(updateDto);
    } else {
      const createDto: CreateVendorAttributeValueDto = {
        value: values.value.trim(),
        valueAr: values.valueAr.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };
      await onSubmit(createDto);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Tag size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {isEdit
                  ? t('attributes.valueModal.editTitle', 'Edit Attribute Value')
                  : t('attributes.valueModal.addTitle', 'Add New Value')}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('attributes.valueModal.parentAttribute', 'Attribute: {{name}}', {
                  name: attributeDisplayName,
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* English Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.valueModal.valueEnLabel', 'Value (English)')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="e.g. XL, Red, Cotton"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.value
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
              }`}
              {...register('value', {
                required: t(
                  'attributes.valueModal.valueEnRequired',
                  'English value is required'
                ),
              })}
            />
            {errors.value && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.value.message}
              </p>
            )}
          </div>

          {/* Arabic Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.valueModal.valueArLabel', 'Value (Arabic)')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="مثال: كبير جداً، أحمر، قطن"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.valueAr
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
              }`}
              {...register('valueAr', {
                required: t(
                  'attributes.valueModal.valueArRequired',
                  'Arabic value is required'
                ),
              })}
            />
            {errors.valueAr && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.valueAr.message}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.valueModal.sortOrderLabel', 'Sort Order')}
            </label>
            <input
              type="number"
              min="0"
              placeholder="1"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-gray-400">
              {t(
                'attributes.valueModal.sortOrderHint',
                'Determines the position of this value in product dropdowns.'
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('attributes.form.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('attributes.form.saving', 'Saving...')}</span>
                </>
              ) : (
                <span>
                  {isEdit
                    ? t('attributes.valueModal.updateBtn', 'Save Value')
                    : t('attributes.valueModal.createBtn', 'Add Value')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
