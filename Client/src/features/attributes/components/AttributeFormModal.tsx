import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import type {
  VendorAttribute,
  CreateVendorAttributeDto,
  UpdateVendorAttributeDto,
  CreateVendorAttributeValueDto,
} from '../types';

interface AttributeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribute?: VendorAttribute | null;
  onSubmit: (
    data: CreateVendorAttributeDto | UpdateVendorAttributeDto
  ) => Promise<void>;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  nameAr: string;
  sortOrder: number;
}

export const AttributeFormModal = ({
  isOpen,
  onClose,
  attribute,
  onSubmit,
  isSubmitting = false,
}: AttributeFormModalProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isEdit = Boolean(attribute);

  // Initial values state for creation mode
  const [initialValues, setInitialValues] = useState<
    CreateVendorAttributeValueDto[]
  >([]);
  const [newValueEn, setNewValueEn] = useState('');
  const [newValueAr, setNewValueAr] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      nameAr: '',
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (attribute) {
        reset({
          name: attribute.name || '',
          nameAr: attribute.nameAr || '',
          sortOrder: attribute.sortOrder ?? 0,
        });
      } else {
        reset({
          name: '',
          nameAr: '',
          sortOrder: 0,
        });
        setInitialValues([]);
        setNewValueEn('');
        setNewValueAr('');
      }
    }
  }, [isOpen, attribute, reset]);

  if (!isOpen) return null;

  const handleAddInitialValue = () => {
    const en = newValueEn.trim();
    const ar = newValueAr.trim();
    if (!en && !ar) return;

    setInitialValues((prev) => [
      ...prev,
      {
        value: en || ar,
        valueAr: ar || en,
        sortOrder: prev.length + 1,
      },
    ]);
    setNewValueEn('');
    setNewValueAr('');
  };

  const handleRemoveInitialValue = (index: number) => {
    setInitialValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (isEdit) {
      const updateDto: UpdateVendorAttributeDto = {
        name: values.name.trim(),
        nameAr: values.nameAr.trim(),
        sortOrder: Number(values.sortOrder) || 0,
      };
      await onSubmit(updateDto);
    } else {
      const createDto: CreateVendorAttributeDto = {
        name: values.name.trim(),
        nameAr: values.nameAr.trim(),
        sortOrder: Number(values.sortOrder) || 0,
        values: initialValues.length > 0 ? initialValues : undefined,
      };
      await onSubmit(createDto);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles size={18} />
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit
                ? t('attributes.form.editTitle', 'Edit Attribute')
                : t('attributes.form.createTitle', 'Create New Attribute')}
            </h2>
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* English Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.form.nameEnLabel', 'Attribute Name (English)')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="e.g. Size, Color, Material"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.name
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
              }`}
              {...register('name', {
                required: t(
                  'attributes.form.nameEnRequired',
                  'English attribute name is required'
                ),
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Arabic Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.form.nameArLabel', 'Attribute Name (Arabic)')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="مثال: المقاس، اللون، الخامة"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.nameAr
                  ? 'border-red-400 bg-red-50/30'
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
              }`}
              {...register('nameAr', {
                required: t(
                  'attributes.form.nameArRequired',
                  'Arabic attribute name is required'
                ),
              })}
            />
            {errors.nameAr && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.nameAr.message}
              </p>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('attributes.form.sortOrderLabel', 'Sort Order')}
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              {...register('sortOrder', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-gray-400">
              {t(
                'attributes.form.sortOrderHint',
                'Lower numbers appear first in product option selectors.'
              )}
            </p>
          </div>

          {/* Initial Values (only in create mode) */}
          {!isEdit && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('attributes.form.initialValuesLabel', 'Initial Values (Optional)')}
              </label>

              {/* Add value input row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  dir="ltr"
                  value={newValueEn}
                  onChange={(e) => setNewValueEn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInitialValue();
                    }
                  }}
                  placeholder="Value En (e.g. Small)"
                  className="px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="rtl"
                    value={newValueAr}
                    onChange={(e) => setNewValueAr(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInitialValue();
                      }
                    }}
                    placeholder="القيمة بالعربية (مثال: صغير)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInitialValue}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Added chips */}
              {initialValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
                  {initialValues.map((val, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs font-medium"
                    >
                      <span>{val.value}</span>
                      {val.valueAr && val.valueAr !== val.value && (
                        <span className="text-gray-400 text-[11px]">
                          ({val.valueAr})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveInitialValue(idx)}
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
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
                    ? t('attributes.form.updateBtn', 'Save Changes')
                    : t('attributes.form.createBtn', 'Create Attribute')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
