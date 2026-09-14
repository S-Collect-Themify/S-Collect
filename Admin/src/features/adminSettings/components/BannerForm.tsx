import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAdminSettingsStore, MAX_ACTIVE_BANNERS } from '../store';
import i18n from '../../../i18n';
import toast from 'react-hot-toast';
import Toggle from '../../../components/ui/Toggle';
import type { BannerLinkType } from '../types';
import { useBannersData } from '../hooks/useBannersData';
import { getAdminCategories } from '../../../services/categories';
import { getAdminProducts } from '../../../services/products';
import { getVendors } from '../../../services/vendors';

interface BannerFormProps {
  mode: 'add' | 'edit';
}

interface BannerFormValues {
  title: string;
  linkType: BannerLinkType;
  linkTargetId: string;
  externalUrl: string;
  endsAt: string;
  isActive: boolean;
}

// ─── Link Type Options ─────────────────────────────────────────────────────────
const LINK_TYPE_OPTIONS: { value: BannerLinkType; label: string; icon: string }[] = [
  { value: 'CATEGORY', label: 'Category', icon: '🗂️' },
  { value: 'PRODUCT', label: 'Product', icon: '📦' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏪' },
  { value: 'EXTERNAL_URL', label: 'External Link', icon: '🔗' },
];

const extractProductsArray = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === 'object') {
    if (Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data.products)) return res.data.products;
  }
  return [];
};

export const BannerForm: React.FC<BannerFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { editingBanner, setEditingBanner, setViewMode } =
    useAdminSettingsStore();
  const { banners, createBannerMutation, updateBannerMutation } = useBannersData();
  const isArabic = i18n.language === 'ar';
  const BreadcrumbChevron = isArabic ? ChevronLeft : ChevronRight;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEnableModalOpen, setConfirmEnableModalOpen] = useState(false);

  // ── Options Data Fetching via Dedicated Endpoints ──
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-banner-options'],
    queryFn: () => getAdminCategories({ pageNum: 1, pageSize: 100 }),
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: rawProductsData } = useQuery({
    queryKey: ['admin-products-banner-options'],
    queryFn: () => getAdminProducts({ pageNum: 1, pageSize: 100 }),
  });
  const products = extractProductsArray(rawProductsData);

  const { data: vendorsData } = useQuery({
    queryKey: ['admin-vendors-banner-options'],
    queryFn: () => getVendors({ pageSize: 100 }),
  });
  const vendors = Array.isArray(vendorsData)
    ? vendorsData
    : Array.isArray((vendorsData as any)?.items)
    ? (vendorsData as any).items
    : Array.isArray((vendorsData as any)?.data)
    ? (vendorsData as any).data
    : [];

  // ── React Hook Form ──
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: {
      title: '',
      linkType: 'CATEGORY',
      linkTargetId: '',
      externalUrl: '',
      endsAt: '',
      isActive: false,
    },
  });

  const title = watch('title') || '';
  const linkType = watch('linkType') || 'CATEGORY';
  const isActive = watch('isActive') || false;

  // ── Image state ──
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCount = banners.filter(
    (b) => b.isActive && (mode === 'add' || b.id !== editingBanner?.id)
  ).length;
  const isMaxActiveReached = activeCount >= MAX_ACTIVE_BANNERS;

  // ── Populate on open ──
  useEffect(() => {
    if (mode === 'edit' && editingBanner) {
      reset({
        title: editingBanner.name || '',
        linkType: editingBanner.linkType || 'CATEGORY',
        linkTargetId: editingBanner.linkTargetId || '',
        externalUrl: editingBanner.externalUrl || '',
        endsAt: editingBanner.endsAt ? editingBanner.endsAt.slice(0, 16) : '',
        isActive: Boolean(editingBanner.isActive),
      });
      setImagePreview(editingBanner.imageUrl || null);
      setImageFileName(editingBanner.imageFileName || '');
      setImageDimensions(editingBanner.imageDimensions || '');
    } else {
      reset({
        title: '',
        linkType: 'CATEGORY',
        linkTargetId: '',
        externalUrl: '',
        endsAt: '',
        isActive: false,
      });
      setImagePreview(null);
      setImageFile(null);
      setImageFileName('');
      setImageDimensions('');
    }
    setImageError(null);
    setConfirmEnableModalOpen(false);
  }, [mode, editingBanner, reset]);

  // ── Handle link type selection by user ──
  const handleSelectLinkType = (newType: BannerLinkType) => {
    if (newType !== linkType) {
      setValue('linkType', newType, { shouldValidate: true });
      setValue('linkTargetId', '');
      setValue('externalUrl', '');
    }
  };

  // ── Image Handlers ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const MAX_SIZE = 3 * 1024 * 1024;
    if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE) {
      setImageError(
        isArabic
          ? 'حجم صورة الـ Banner لا يتجاوز 3MB — الصيغ: PNG, JPG, WEBP.'
          : 'Banner image size must not exceed 3MB — Formats: PNG, JPG, WEBP.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageError(null);
      setImagePreview(objectUrl);
      setImageFileName(file.name);
      setImageDimensions(`Dimensions: ${img.width} × ${img.height} px`);
    };
    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Active Toggle ──
  const handleToggleActive = (checked: boolean) => {
    if (checked) {
      if (isMaxActiveReached) {
        toast.error(
          isArabic
            ? 'لا يمكن تفعيل أكثر من 5 بانرات في نفس الوقت.'
            : 'Cannot activate more than 5 banners at the same time.'
        );
        setValue('isActive', false);
        return;
      }
      setValue('isActive', true);
      setConfirmEnableModalOpen(true);
    } else {
      setValue('isActive', false);
    }
  };

  const handleCancelEnable = () => {
    setValue('isActive', false);
    setConfirmEnableModalOpen(false);
  };

  const handleConfirmEnable = () => {
    setValue('isActive', true);
    setConfirmEnableModalOpen(false);
  };

  // ── Submit Handler using React Query Mutations ──
  const onSubmit: SubmitHandler<BannerFormValues> = async (formData) => {
    if (mode === 'add' && !imageFile) {
      setImageError(isArabic ? 'صورة البانر مطلوبة' : 'Banner image is required');
      return;
    }
    if (imageError) return;

    const isEndsAtInPast = formData.endsAt
      ? new Date(formData.endsAt).getTime() <= Date.now()
      : false;

    if (formData.isActive && isEndsAtInPast) {
      toast.error(
        isArabic
          ? 'لا يمكن تفعيل البنر لأن تاريخ الانتهاء قد مضى. يرجى تحديث التاريخ أو مسحه.'
          : 'Cannot activate banner because the expiration date (Ends At) is in the past. Please update or clear the expiration date.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const endsAtPayload = formData.endsAt ? new Date(formData.endsAt).toISOString() : null;

      if (mode === 'add') {
        await createBannerMutation.mutateAsync({
          title: formData.title.trim(),
          linkType: formData.linkType,
          image: imageFile!,
          linkTargetId:
            formData.linkType !== 'EXTERNAL_URL' ? formData.linkTargetId || undefined : undefined,
          externalUrl:
            formData.linkType === 'EXTERNAL_URL' ? formData.externalUrl.trim() || undefined : undefined,
          endsAt: endsAtPayload || undefined,
          sortOrder: banners.length + 1,
          isActive: Boolean(formData.isActive),
        });
        setViewMode('banners');
      } else if (editingBanner) {
        await updateBannerMutation.mutateAsync({
          id: editingBanner.id,
          payload: {
            title: formData.title.trim(),
            linkType: formData.linkType,
            image: imageFile || undefined,
            linkTargetId:
              formData.linkType !== 'EXTERNAL_URL' ? formData.linkTargetId || undefined : undefined,
            externalUrl:
              formData.linkType === 'EXTERNAL_URL' ? formData.externalUrl.trim() || undefined : undefined,
            endsAt: endsAtPayload,
            isActive: Boolean(formData.isActive),
          },
        });
        setViewMode('banners');
        setEditingBanner(null);
      }
    } catch {
      // Error handling is handled in mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          {mode === 'add'
            ? t('banners.add.title', { defaultValue: 'Add New Banner' })
            : t('banners.edit.title', { defaultValue: 'Edit Banner' })}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <BreadcrumbChevron size={12} />
          <button
            type="button"
            onClick={() => setViewMode('banners')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.banners', { defaultValue: 'Banners' })}
          </button>
          <BreadcrumbChevron size={12} />
          <span className="text-gray-600 font-semibold">
            {mode === 'add'
              ? t('banners.breadcrumb.addNewBanner', { defaultValue: 'Add New Banner' })
              : t('banners.breadcrumb.editBanner', { defaultValue: 'Edit Banner' })}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs w-full md:w-3/5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Banner Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="bannerName" className="text-sm font-semibold text-gray-900 block">
                {t('banners.form.bannerTitle', { defaultValue: 'Banner Title' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-normal">{title.length}/50</span>
            </div>
            <input
              id="bannerName"
              type="text"
              maxLength={50}
              {...register('title', {
                required: t('banners.form.errors.titleRequired', { defaultValue: 'Banner title is required (2–50 chars)' }),
                minLength: {
                  value: 2,
                  message: t('banners.form.errors.titleRequired', { defaultValue: 'Banner title is required (2–50 chars)' }),
                },
                maxLength: {
                  value: 50,
                  message: t('banners.form.errors.titleMaxLength', { defaultValue: 'Title must not exceed 50 characters' }),
                },
              })}
              placeholder={t('banners.form.bannerTitlePlaceholder', { defaultValue: 'Enter banner title (e.g. Winter Sale)' })}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title.message}</p>}
          </div>

          {/* Banner Image */}
          <div>
            <label htmlFor="banner-file-input" className="text-sm font-semibold text-gray-900 mb-2 block">
              {t('banners.form.bannerImage', { defaultValue: 'Banner Image' })}{' '}
              {mode === 'add' && <span className="text-red-500">*</span>}
            </label>
            <input
              id="banner-file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {imagePreview ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                    <img src={imagePreview} alt="Banner Preview" className="size-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{imageFileName}</h4>
                    <p className="text-xs text-gray-400 font-normal">{imageDimensions}</p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer mt-1 block"
                    >
                      {t('banners.form.removeImage', { defaultValue: 'Remove Image' })}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  imageError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {imageError ? (
                  <div className="flex flex-col items-center">
                    <AlertCircle className="size-7 text-red-500 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-red-500 mb-1">{imageError}</p>
                    <p className="text-[11px] text-gray-400 font-normal">Max 3MB — PNG, JPG, WEBP.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="size-6 text-gray-400 mb-2 stroke-[1.75]" />
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      {t('banners.form.uploadBannerImage', { defaultValue: 'Upload Banner Image' })}
                    </p>
                    <p className="text-[11px] text-gray-400 font-normal">PNG, JPG, WEBP — Max 3MB</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Link Type Selector */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              {t('banners.form.linkType', { defaultValue: 'Link Type' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LINK_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectLinkType(opt.value)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    linkType === opt.value
                      ? 'border-gray-900 bg-gray-950 text-white shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.value === 'CATEGORY'
                    ? t('banners.linkTypes.category', { defaultValue: 'Category' })
                    : opt.value === 'PRODUCT'
                    ? t('banners.linkTypes.product', { defaultValue: 'Product' })
                    : opt.value === 'VENDOR'
                    ? t('banners.linkTypes.vendor', { defaultValue: 'Vendor' })
                    : t('banners.linkTypes.externalUrl', { defaultValue: 'External Link' })}
                </button>
              ))}
            </div>
          </div>

          {/* Link Target DDL / Input Field */}
          {linkType === 'CATEGORY' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('banners.form.selectCategory', { defaultValue: 'Select Category' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('linkTargetId', {
                    required:
                      linkType === 'CATEGORY'
                        ? t('banners.form.errors.categoryRequired', { defaultValue: 'Category is required' })
                        : false,
                  })}
                  className={`w-full appearance-none border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer ${
                    errors.linkTargetId ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <option value="">
                    {t('banners.form.selectCategoryPlaceholder', { defaultValue: '-- Select Category --' })}
                  </option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {isArabic && cat.nameAr ? cat.nameAr : cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5" />
              </div>
              {errors.linkTargetId && <p className="text-xs text-red-500 mt-1.5">{errors.linkTargetId.message}</p>}
            </div>
          )}

          {linkType === 'PRODUCT' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('banners.form.selectProduct', { defaultValue: 'Select Product' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('linkTargetId', {
                    required:
                      linkType === 'PRODUCT'
                        ? t('banners.form.errors.productRequired', { defaultValue: 'Product is required' })
                        : false,
                  })}
                  className={`w-full appearance-none border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer ${
                    errors.linkTargetId ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <option value="">
                    {t('banners.form.selectProductPlaceholder', { defaultValue: '-- Select Product --' })}
                  </option>
                  {products.map((prod: any) => (
                    <option key={prod.id} value={prod.id}>
                      {isArabic && prod.nameAr ? prod.nameAr : prod.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5" />
              </div>
              {errors.linkTargetId && <p className="text-xs text-red-500 mt-1.5">{errors.linkTargetId.message}</p>}
            </div>
          )}

          {linkType === 'VENDOR' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('banners.form.selectVendor', { defaultValue: 'Select Vendor' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('linkTargetId', {
                    required:
                      linkType === 'VENDOR'
                        ? t('banners.form.errors.vendorRequired', { defaultValue: 'Vendor is required' })
                        : false,
                  })}
                  className={`w-full appearance-none border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer ${
                    errors.linkTargetId ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <option value="">
                    {t('banners.form.selectVendorPlaceholder', { defaultValue: '-- Select Vendor --' })}
                  </option>
                  {vendors.map((vend: any) => {
                    const vendorName =
                      (isArabic && vend.storeNameAr ? vend.storeNameAr : vend.storeName) ||
                      (isArabic && vend.nameAr ? vend.nameAr : vend.name) ||
                      `${vend.firstName || ''} ${vend.lastName || ''}`.trim() ||
                      vend.id;
                    return (
                      <option key={vend.id} value={vend.id}>
                        {vendorName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rtl:right-auto rtl:left-3.5" />
              </div>
              {errors.linkTargetId && <p className="text-xs text-red-500 mt-1.5">{errors.linkTargetId.message}</p>}
            </div>
          )}

          {linkType === 'EXTERNAL_URL' && (
            <div>
              <label htmlFor="banner-external-url" className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('banners.form.externalUrl', { defaultValue: 'External Link URL' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="banner-external-url"
                type="url"
                {...register('externalUrl', {
                  required:
                    linkType === 'EXTERNAL_URL'
                      ? t('banners.form.errors.urlRequired', { defaultValue: 'External URL is required' })
                      : false,
                  pattern: {
                    value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i,
                    message: t('banners.form.errors.urlInvalid', { defaultValue: 'Please enter a valid URL' }),
                  },
                })}
                placeholder="https://example.com"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder-gray-500 ${
                  errors.externalUrl ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
                }`}
              />
              {errors.externalUrl && <p className="text-xs text-red-500 mt-1.5">{errors.externalUrl.message}</p>}
            </div>
          )}

          {/* Expiration Date */}
          <div>
            <label htmlFor="banner-ends-at" className="text-sm font-semibold text-gray-900 mb-2 block">
              {t('banners.form.endsAt', { defaultValue: 'Expiration Date (Ends At)' })}
            </label>
            <input
              id="banner-ends-at"
              type="datetime-local"
              {...register('endsAt')}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Banner Status Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-900 block">
                  {t('banners.form.bannerStatus', { defaultValue: 'Banner Status' })}
                </label>
                <p className="text-xs text-gray-400 font-normal mt-0.5">
                  {t('banners.form.bannerStatusHint', {
                    defaultValue: 'Active banners will display on platform home page instantly.',
                  })}
                </p>
                {isMaxActiveReached && !isActive && (
                  <p className="text-xs text-amber-600 font-semibold mt-1">
                    {isArabic
                      ? 'تم الوصول للحد الأقصى للبانرات المفعلة (5 بانرات). سينشأ البنر كغير مفعل.'
                      : 'Maximum active banners limit reached (5 active banners). Banner will be created as inactive.'}
                  </p>
                )}
              </div>
              <Toggle
                checked={isActive}
                onChange={handleToggleActive}
                disabled={isMaxActiveReached && !isActive}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setViewMode('banners')}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('banners.form.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {mode === 'add'
                ? t('banners.form.saveBanner', { defaultValue: 'Save Banner' })
                : t('banners.form.saveChanges', { defaultValue: 'Save Changes' })}
            </button>
          </div>
        </form>
      </div>

      {/* Enable Banner Confirmation Modal */}
      {confirmEnableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 relative">
            <div className="flex flex-col items-center">
              <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle2 size={26} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('banners.enableModal.title', { defaultValue: 'Enable Banner' })}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-xs">
                {t('banners.enableModal.message', {
                  defaultValue:
                    'Are you sure you want to enable this banner? It will immediately be displayed on the platform home page.',
                })}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={handleCancelEnable}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  {t('banners.deleteModal.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEnable}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {t('banners.enableModal.confirm', { defaultValue: 'Enable Banner' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
