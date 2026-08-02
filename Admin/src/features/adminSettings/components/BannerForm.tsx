import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAdminSettingsStore, MAX_ACTIVE_BANNERS } from '../store';
import i18n from '../../../i18n';
import toast from 'react-hot-toast';
import Toggle from '../../categories/components/Toggle';
import type { BannerLinkType } from '../types';
import { getAdminCategories } from '../../../services/categories';
import { getVendors } from '../../../services/vendors';
import { getAllProducts } from '../../../services/products';
import type { ApiCategoryItem } from '../../../services/categories';
import type { BackendVendor } from '../../../services/vendors';

interface BannerFormProps {
  mode: 'add' | 'edit';
}

// ─── Link Type Options ─────────────────────────────────────────────────────────
const LINK_TYPE_OPTIONS: { value: BannerLinkType; label: string; icon: string }[] = [
  { value: 'CATEGORY', label: 'Category', icon: '🗂️' },
  { value: 'PRODUCT', label: 'Product', icon: '📦' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏪' },
  { value: 'EXTERNAL_URL', label: 'External Link', icon: '🔗' },
];

export const BannerForm: React.FC<BannerFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { createBannerApi, updateBannerApi, editingBanner, setViewMode, banners } =
    useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const BreadcrumbChevron = isArabic ? ChevronLeft : ChevronRight;

  // ── Form state ──
  const [title, setTitle] = useState('');
  const [linkType, setLinkType] = useState<BannerLinkType>('CATEGORY');
  const [linkTargetId, setLinkTargetId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEnableModalOpen, setConfirmEnableModalOpen] = useState(false);

  // ── Image state ──
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Dynamic DDL data ──
  const [categories, setCategories] = useState<ApiCategoryItem[]>([]);
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; nameEn?: string }[]>([]);
  const [ddlLoading, setDdlLoading] = useState(false);

  const [titleError, setTitleError] = useState<string | null>(null);

  // ── Populate on open ──
  useEffect(() => {
    if (mode === 'edit' && editingBanner) {
      setTitle(editingBanner.name || '');
      setLinkType(editingBanner.linkType || 'CATEGORY');
      setLinkTargetId(editingBanner.linkTargetId || '');
      setExternalUrl(editingBanner.externalUrl || '');
      setEndsAt(editingBanner.endsAt ? editingBanner.endsAt.slice(0, 16) : '');
      setIsActive(editingBanner.isActive);
      setImagePreview(editingBanner.imageUrl || null);
      setImageFileName(editingBanner.imageFileName || '');
      setImageDimensions(editingBanner.imageDimensions || '');
    } else {
      setTitle('');
      setLinkType('CATEGORY');
      setLinkTargetId('');
      setExternalUrl('');
      setEndsAt('');
      setIsActive(false);
      setImagePreview(null);
      setImageFile(null);
      setImageFileName('');
      setImageDimensions('');
    }
    setImageError(null);
    setTitleError(null);
    setConfirmEnableModalOpen(false);
  }, [mode, editingBanner]);

  // ── Fetch DDL data ──
  useEffect(() => {
    const load = async () => {
      setDdlLoading(true);
      try {
        const [cats, vens, prods] = await Promise.all([
          getAdminCategories(),
          getVendors({ status: 'ACTIVE' }),
          getAllProducts(),
        ]);
        setCategories(cats);
        setVendors(vens);
        const prodArr = (() => {
          if (Array.isArray(prods)) return prods;
          if (prods?.data && Array.isArray(prods.data)) return prods.data;
          if (prods?.items && Array.isArray(prods.items)) return prods.items;
          if (prods?.data?.items && Array.isArray(prods.data.items)) return prods.data.items;
          return [];
        })();
        setProducts(prodArr);
      } catch {
        // silently fail — user can still type
      } finally {
        setDdlLoading(false);
      }
    };
    load();
  }, []);

  // ── Handle link type selection by user ──
  const handleSelectLinkType = (newType: BannerLinkType) => {
    if (newType !== linkType) {
      setLinkType(newType);
      setLinkTargetId('');
      setExternalUrl('');
    }
  };

  // ── Image Handlers ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const MAX_SIZE = 3 * 1024 * 1024;
    if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE) {
      setImageError(isArabic
        ? 'حجم صورة الـ Banner لا يتجاوز 3MB — الصيغ: PNG, JPG, WEBP.'
        : 'Banner image size must not exceed 3MB — Formats: PNG, JPG, WEBP.');
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
      const activeCount = banners.filter(
        (b) => b.isActive && (mode === 'add' || b.id !== editingBanner?.id)
      ).length;
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        toast.error(isArabic
          ? 'لا يمكن تفعيل أكثر من 5 بنرات في نفس الوقت.'
          : 'Cannot activate more than 5 banners at the same time.');
        return;
      }
      setIsActive(true);
      setConfirmEnableModalOpen(true);
    } else {
      setIsActive(false);
    }
  };

  const handleCancelEnable = () => {
    setIsActive(false);
    setConfirmEnableModalOpen(false);
  };
  const handleConfirmEnable = () => {
    setIsActive(true);
    setConfirmEnableModalOpen(false);
  };

  // ── Validation ──
  const isTitleValid = title.trim().length >= 2 && title.trim().length <= 50;
  const isLinkTargetValid = linkType === 'EXTERNAL_URL'
    ? externalUrl.trim().length > 0
    : linkTargetId.trim().length > 0;

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTitleValid) {
      setTitleError(isArabic ? 'عنوان البانر مطلوب (2-50 حرف)' : 'Banner title is required (2–50 chars)');
      return;
    }
    if (!isLinkTargetValid) {
      toast.error(isArabic ? 'يرجى تحديد الرابط المستهدف' : 'Please select a link target');
      return;
    }
    if (mode === 'add' && !imageFile) {
      setImageError(isArabic ? 'صورة البانر مطلوبة' : 'Banner image is required');
      return;
    }
    if (imageError) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await createBannerApi({
          title: title.trim(),
          linkType,
          image: imageFile!,
          linkTargetId: linkType !== 'EXTERNAL_URL' ? linkTargetId || undefined : undefined,
          externalUrl: linkType === 'EXTERNAL_URL' ? externalUrl.trim() || undefined : undefined,
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
          sortOrder: banners.length + 1,
        });
      } else if (editingBanner) {
        await updateBannerApi(editingBanner.id, {
          title: title.trim(),
          linkType,
          image: imageFile || null,
          linkTargetId: linkType !== 'EXTERNAL_URL' ? (linkTargetId || undefined) : undefined,
          externalUrl: linkType === 'EXTERNAL_URL' ? (externalUrl.trim() || undefined) : undefined,
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
          isActive,
        });
      }
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
          <button type="button" onClick={() => setViewMode('settings')} className="hover:text-gray-700 transition-colors cursor-pointer">
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <BreadcrumbChevron size={12} />
          <button type="button" onClick={() => setViewMode('banners')} className="hover:text-gray-700 transition-colors cursor-pointer">
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
        <form onSubmit={handleSubmit} className="space-y-6">

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
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
              placeholder={isArabic ? 'أدخل عنوان البانر (مثال: عروض الشتاء)' : 'Enter banner title (e.g. Winter Sale)'}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                titleError ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {titleError && <p className="text-xs text-red-500 mt-1.5">{titleError}</p>}
          </div>

          {/* Banner Image */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              {t('banners.form.bannerImage', { defaultValue: 'Banner Image' })}{' '}
              {mode === 'add' && <span className="text-red-500">*</span>}
            </label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png,image/jpeg,image/webp" className="hidden" />

            {imagePreview ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                    <img src={imagePreview} alt="Banner Preview" className="size-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{imageFileName}</h4>
                    <p className="text-xs text-gray-400 font-normal">{imageDimensions}</p>
                    <button type="button" onClick={handleRemoveImage} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer mt-1 block">
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
              Link Type <span className="text-red-500">*</span>
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
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Link Target */}
          {linkType !== 'EXTERNAL_URL' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                {linkType === 'CATEGORY' ? 'Select Category' : linkType === 'PRODUCT' ? 'Select Product' : 'Select Vendor'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  disabled={ddlLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed pr-8"
                >
                  <option value="" disabled>
                    {ddlLoading ? 'Loading...' : `Choose a ${linkType.toLowerCase()}...`}
                  </option>
                  {linkType === 'CATEGORY' && categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.nameEn || c.nameAr}</option>
                  ))}
                  {linkType === 'PRODUCT' && products.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameEn || p.name}</option>
                  ))}
                  {linkType === 'VENDOR' && vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.storeName}</option>
                  ))}
                </select>
                {ddlLoading && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                )}
              </div>
            </div>
          )}

          {/* External URL */}
          {linkType === 'EXTERNAL_URL' && (
            <div>
              <label htmlFor="externalUrl" className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('banners.form.redirectLinkUrl', { defaultValue: 'External URL' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ExternalLink size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="externalUrl"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/target-page"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Ends At</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
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
              </div>
              <Toggle checked={isActive} onChange={handleToggleActive} />
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
