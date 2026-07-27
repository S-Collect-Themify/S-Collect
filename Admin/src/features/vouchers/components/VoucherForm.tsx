import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Calendar, ChevronDown, AlertCircle, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Toggle from '../../categories/components/Toggle';
import type { VoucherItem, VoucherType } from '../types';
import { useCategories } from '../../../hooks/useCategories';

export interface VoucherFormData {
  code: string;
  category: string[];
  scope: string;
  type: VoucherType;
  discountValue: string;
  minOrder: string;
  maxDiscount: string;
  expiryDate: string;
  maxUsage: string;
  limitOnePerCustomer: boolean;
}

interface VoucherFormProps {
  initialVoucher?: VoucherItem | null;
  onSubmit: (formData: VoucherFormData) => void;
  isSubmitting?: boolean;
}

interface CategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  categories: any[];
  isLoading?: boolean;
  error?: boolean;
  language: string;
  placeholder: string;
}

function CategoryMultiSelect({
  value = [],
  onChange,
  categories = [],
  isLoading = false,
  error = false,
  language,
  placeholder,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryName = (cat: any): string => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'number') return String(cat);

    if (typeof cat.name === 'object' && cat.name !== null) {
      return (
        (language === 'ar' ? cat.name.ar || cat.name.en : cat.name.en || cat.name.ar) ||
        JSON.stringify(cat.name)
      );
    }

    if (language === 'ar') {
      if (cat.nameAr && typeof cat.nameAr === 'string') return cat.nameAr;
      if (cat.name_ar && typeof cat.name_ar === 'string') return cat.name_ar;
    } else {
      if (cat.nameEn && typeof cat.nameEn === 'string') return cat.nameEn;
      if (cat.name_en && typeof cat.name_en === 'string') return cat.name_en;
    }

    if (cat.name && typeof cat.name === 'string') return cat.name;
    if (cat.title && typeof cat.title === 'string') return cat.title;
    if (cat.categoryName && typeof cat.categoryName === 'string') return cat.categoryName;
    if (cat.slug && typeof cat.slug === 'string') return cat.slug;
    if (cat.id) return String(cat.id);
    if (cat._id) return String(cat._id);

    return String(cat);
  };

  const allCategoryNames = categories.map(getCategoryName).filter(Boolean);

  const toggleCategory = (catName: string) => {
    if (!catName) return;
    const exists = value.some((v) => String(v).toLowerCase() === catName.toLowerCase());
    let newValue: string[];
    if (exists) {
      newValue = value.filter((v) => String(v).toLowerCase() !== catName.toLowerCase());
    } else {
      newValue = [...value, catName];
    }
    onChange(newValue);
  };

  const removeCategory = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((v) => String(v).toLowerCase() !== catName.toLowerCase());
    onChange(newValue);
  };

  const isAllSelected =
    allCategoryNames.length > 0 &&
    allCategoryNames.every((name) =>
      value.some((v) => String(v).toLowerCase() === name.toLowerCase())
    );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...allCategoryNames]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3 py-1.5 bg-white border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
          error
            ? 'border-red-500 ring-2 ring-red-500/10'
            : isOpen
            ? 'border-gray-400 ring-2 ring-black/5'
            : 'border-gray-200 hover:border-gray-300'
        } ${isLoading ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-sm text-gray-400 font-normal px-1">{placeholder}</span>
          ) : (
            value.map((catName) => (
              <span
                key={catName}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200 animate-in fade-in duration-150"
              >
                <span>{catName}</span>
                <button
                  type="button"
                  onClick={(e) => removeCategory(catName, e)}
                  className="hover:text-red-500 transition-colors cursor-pointer rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {value.length > 0 && (
            <span className="text-[11px] font-bold bg-gray-900 text-white rounded-full px-1.5 py-0.2">
              {value.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          {categories.length > 0 && (
            <div
              onClick={toggleSelectAll}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer font-semibold text-gray-900 border-b border-gray-100 mb-1 select-none"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isAllSelected
                    ? 'bg-black border-black text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isAllSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <span>
                {language === 'ar' ? 'تحديد الكل' : 'Select All'}
              </span>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400">
              {language === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
            </div>
          ) : (
            categories.map((cat) => {
              const catName = getCategoryName(cat);
              const isSelected = value.some(
                (v) => String(v).toLowerCase() === catName.toLowerCase()
              );
              return (
                <div
                  key={cat.id || cat._id || catName}
                  onClick={() => toggleCategory(catName)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors select-none ${
                    isSelected ? 'bg-gray-50/80 font-semibold text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-black border-black text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>{catName}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const parseCategories = (cat?: any): string[] => {
  if (!cat) return [];
  if (Array.isArray(cat))
    return cat.map((item) => (typeof item === 'string' ? item.trim() : String(item))).filter(Boolean);
  if (typeof cat === 'string') {
    return cat.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export const VoucherForm = ({
  initialVoucher = null,
  onSubmit,
  isSubmitting = false,
}: VoucherFormProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: {
      code: initialVoucher?.code || '',
      category: parseCategories(initialVoucher?.category),
      scope: initialVoucher?.scope || 'All',
      type: initialVoucher?.type || 'Percentage',
      discountValue: initialVoucher?.discountValue
        ? String(initialVoucher.discountValue)
        : '',
      minOrder: initialVoucher?.minOrder?.replace('SAR ', '') || '',
      maxDiscount: initialVoucher?.maxDiscount?.replace('SAR ', '') || '',
      expiryDate: initialVoucher?.expiryDate || '',
      maxUsage: initialVoucher?.maxUsage ? String(initialVoucher.maxUsage) : '',
      limitOnePerCustomer: initialVoucher?.limitOnePerCustomer ?? true,
    },
  });

  useEffect(() => {
    if (initialVoucher) {
      reset({
        code: initialVoucher.code || '',
        category: parseCategories(initialVoucher.category),
        scope: initialVoucher.scope || 'All',
        type: initialVoucher.type || 'Percentage',
        discountValue: initialVoucher.discountValue
          ? String(initialVoucher.discountValue)
          : '',
        minOrder: initialVoucher.minOrder?.replace('SAR ', '') || '',
        maxDiscount: initialVoucher.maxDiscount?.replace('SAR ', '') || '',
        expiryDate: initialVoucher.expiryDate || '',
        maxUsage: initialVoucher.maxUsage
          ? String(initialVoucher.maxUsage)
          : '',
        limitOnePerCustomer: initialVoucher.limitOnePerCustomer ?? true,
      });
    }
  }, [initialVoucher, reset]);

  const selectedType = watch('type');

  const onFormSubmit = (data: VoucherFormData) => {
    onSubmit({
      ...data,
      code: data.code.trim(),
      category: Array.isArray(data.category) ? data.category : [],
      scope: data.scope?.trim() || 'All',
      discountValue: data.discountValue.trim(),
      minOrder: data.minOrder.trim(),
      maxDiscount: data.maxDiscount.trim(),
      expiryDate: data.expiryDate.trim(),
      maxUsage: data.maxUsage.trim(),
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 max-w-3xl shadow-xs">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Voucher Code * (Mandatory) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('vouchersListing.form.voucherCode')}
          </label>
          <input
            type="text"
            placeholder={t('vouchersListing.form.voucherCodePlaceholder')}
            {...register('code', {
              required: t('vouchersListing.form.errors.voucherCodeRequired'),
            })}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
              errors.code
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
            }`}
          />
          {errors.code && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle size={13} />
              <span>{errors.code.message}</span>
            </div>
          )}
        </div>

        {/* Category Multi-Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('vouchersListing.form.category')}
          </label>
          <Controller
            name="category"
            control={control}
            rules={{
              validate: (val) => {
                if (Array.isArray(val) && val.length > 0) return true;
                if (typeof val === 'string' && val.trim().length > 0) return true;
                return t('vouchersListing.form.errors.categoryRequired');
              },
            }}
            render={({ field: { value, onChange } }) => (
              <CategoryMultiSelect
                value={Array.isArray(value) ? value : []}
                onChange={onChange}
                categories={categories}
                isLoading={isCategoriesLoading}
                error={Boolean(errors.category)}
                language={i18n.language}
                placeholder={t('vouchersListing.form.categoryPlaceholder', {
                  defaultValue: 'Select Categories',
                })}
              />
            )}
          />
          {errors.category && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle size={13} />
              <span>{errors.category.message}</span>
            </div>
          )}
        </div>

        {/* Scope Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('vouchersListing.form.scope')}
          </label>
          <div className="relative">
            <select
              {...register('scope', { required: true })}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-9 rtl:pr-4"
            >
              <option value="All">
                {t('vouchersListing.scopes.all', { defaultValue: 'All' })}
              </option>
              <option value="Percentage">
                {t('vouchersListing.scopes.percentage', { defaultValue: 'Percentage' })}
              </option>
              <option value="Category">
                {t('vouchersListing.scopes.category', { defaultValue: 'Category' })}
              </option>
              <option value="Vendor">
                {t('vouchersListing.scopes.vendor', { defaultValue: 'Vendor' })}
              </option>
              <option value="Product">
                {t('vouchersListing.scopes.product', { defaultValue: 'Product' })}
              </option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5"
            />
          </div>
        </div>

        {/* Voucher Type * & Discount Value * Grid (Mandatory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.voucherType')}
            </label>
            <div className="relative">
              <select
                {...register('type', { required: true })}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 cursor-pointer rtl:pl-9 rtl:pr-4"
              >
                <option value="Percentage">
                  {t('vouchersListing.types.percentage')}
                </option>
                <option value="Amount">{t('vouchersListing.types.amount')}</option>
                <option value="Free Shipping">
                  {t('vouchersListing.types.freeShipping')}
                </option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.discountValue')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.discountValuePlaceholder')}
              disabled={selectedType === 'Free Shipping'}
              {...register('discountValue', {
                required:
                  selectedType !== 'Free Shipping'
                    ? t('vouchersListing.form.errors.discountValueRequired')
                    : false,
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.discountValueInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.discountValue
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              } ${selectedType === 'Free Shipping' ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.discountValue && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.discountValue.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Minimum Order Amount & Maximum Discount Grid (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.minOrderAmount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.minOrderAmountPlaceholder')}
              {...register('minOrder', {
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.minOrderInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.minOrder
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.minOrder && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.minOrder.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.maxDiscountAmount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.maxDiscountAmountPlaceholder')}
              {...register('maxDiscount', {
                pattern: {
                  value: /^\d+(\.\d+)?$/,
                  message: t('vouchersListing.form.errors.maxDiscountInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.maxDiscount
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.maxDiscount && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.maxDiscount.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Date & Maximum Usage Count Grid (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.expiryDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                placeholder={t('vouchersListing.form.expiryDatePlaceholder')}
                {...register('expiryDate', {
                  required: t('vouchersListing.form.errors.expiryDateRequired'),
                })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                  errors.expiryDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                    : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
                }`}
              />
              <Calendar
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5 hidden sm:block"
              />
            </div>
            {errors.expiryDate && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.expiryDate.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {t('vouchersListing.form.maxUsageCount')}
            </label>
            <input
              type="text"
              placeholder={t('vouchersListing.form.maxUsageCountPlaceholder')}
              {...register('maxUsage', {
                pattern: {
                  value: /^[1-9]\d*$/,
                  message: t('vouchersListing.form.errors.maxUsageInvalid'),
                },
              })}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all ${
                errors.maxUsage
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                  : 'border-gray-200 focus:ring-2 focus:ring-black/5 focus:border-gray-400'
              }`}
            />
            {errors.maxUsage && (
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle size={13} />
                <span>{errors.maxUsage.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Limit to one use per customer Toggle Row */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <Controller
              name="limitOnePerCustomer"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Toggle checked={value} onChange={onChange} />
              )}
            />
            <div>
              <span className="block text-sm font-bold text-gray-900">
                {t('vouchersListing.form.limitOnePerCustomer')}
              </span>
              <span className="block text-xs text-gray-400 mt-0.5">
                {t('vouchersListing.form.limitOnePerCustomerDesc')}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/vouchers')}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-center"
          >
            {t('vouchersListing.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer text-center"
          >
            {initialVoucher
              ? t('vouchersListing.form.saveChanges')
              : t('vouchersListing.form.createVoucher')}
          </button>
        </div>
      </form>
    </div>
  );
};
