import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
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

interface MobileBannerFormProps {
  mode: 'add' | 'edit';
}

const LINK_TYPE_OPTIONS: { value: BannerLinkType; label: string; icon: string }[] = [
  { value: 'CATEGORY', label: 'Category', icon: '🗂️' },
  { value: 'PRODUCT', label: 'Product', icon: '📦' },
  { value: 'VENDOR', label: 'Vendor', icon: '🏪' },
  { value: 'EXTERNAL_URL', label: 'External Link', icon: '🔗' },
];

export const MobileBannerForm: React.FC<MobileBannerFormProps> = ({ mode }) => {
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

  // ── Image state ──
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── DDL data ──
  const [categories, setCategories] = useState<ApiCategoryItem[]>([]);
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; nameEn?: string }[]>([]);
  const [ddlLoading, setDdlLoading] = useState(false);

  const [confirmEnableModalOpen, setConfirmEnableModalOpen] = useState(false);
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
    }
    setImageError(null);
    setTitleError(null);
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
        // silently fail
      } finally {
        setDdlLoading(false);
      }
    };
    load();
  }, []);

  const handleSelectLinkType = (newType: BannerLinkType) => {
    if (newType !== linkType) {
      setLinkType(newType);
      setLinkTargetId('');
      setExternalUrl('');
    }
  };

  // ── Image ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const MAX_SIZE = 3 * 1024 * 1024;
    if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE) {
      setImageError(isArabic ? 'حجم صورة الـ Banner لا يتجاوز 3MB — الصيغ: PNG, JPG, WEBP.' : 'Max 3MB — PNG, JPG, WEBP.');
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

  // ── Toggle ──
  const handleToggleActive = () => {
    if (!isActive) {
      const activeCount = banners.filter((b) => b.isActive && (mode === 'add' || b.id !== editingBanner?.id)).length;
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        toast.error(isArabic ? 'لا يمكن تفعيل أكثر من 5 بانرات في نفس الوقت.' : 'Cannot activate more than 5 banners at the same time.');
        return;
      }
      setConfirmEnableModalOpen(true);
    } else {
      setIsActive(false);
    }
  };

  const handleConfirmEnable = () => {
    setIsActive(true);
    setConfirmEnableModalOpen(false);
  };

  // ── Validation ──
  const isTitleValid = title.trim().length >= 2 && title.trim().length <= 50;
  const isLinkTargetValid = linkType === 'EXTERNAL_URL' ? externalUrl.trim().length > 0 : linkTargetId.trim().length > 0;

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
        });
      } else if (editingBanner) {
        await updateBannerApi(editingBanner.id, {
          title: title.trim(),
          linkType,
          image: imageFile || null,
          linkTargetId: linkType !== 'EXTERNAL_URL' ? (linkTargetId || null) : null,
          externalUrl: linkType === 'EXTERNAL_URL' ? (externalUrl.trim() || null) : null,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          isActive,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">
          {mode === 'add' ? t('banners.add.title', { defaultValue: 'Add New Banner' }) : t('banners.edit.title', { defaultValue: 'Edit Banner' })}
        </h1>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
          <button type="button" onClick={() => setViewMode('settings')} className="hover:text-black transition-colors cursor-pointer">
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <BreadcrumbChevron size={10} />
          <button type="button" onClick={() => setViewMode('banners')} className="hover:text-black transition-colors cursor-pointer">
            {t('banners.breadcrumb.banners', { defaultValue: 'Banners' })}
          </button>
          <BreadcrumbChevron size={10} />
          <span className="text-gray-700 font-semibold">
            {mode === 'add' ? t('banners.breadcrumb.addNewBanner', { defaultValue: 'Add New Banner' }) : t('banners.breadcrumb.editBanner', { defaultValue: 'Edit Banner' })}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-900">
                {t('banners.form.bannerTitle', { defaultValue: 'Banner Title' })} <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">{title.length}/50</span>
            </div>
            <input
              type="text"
              maxLength={50}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
              placeholder={isArabic ? 'أدخل عنوان البانر' : 'Enter banner title'}
              className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all ${titleError ? 'border-red-400 bg-red-50/20' : 'border-gray-200'}`}
            />
            {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-1.5 block">
              {t('banners.form.bannerImage', { defaultValue: 'Banner Image' })} {mode === 'add' && <span className="text-red-500">*</span>}
            </label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png,image/jpeg,image/webp" className="hidden" />

            {imagePreview ? (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                  <img src={imagePreview} alt="Preview" className="size-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{imageFileName}</p>
                  <p className="text-[10px] text-gray-400">{imageDimensions}</p>
                  <button type="button" onClick={handleRemoveImage} className="text-[11px] font-semibold text-red-500 hover:text-red-600 cursor-pointer mt-0.5">
                    {t('banners.form.removeImage', { defaultValue: 'Remove' })}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer ${imageError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50'}`}
              >
                {imageError ? (
                  <><AlertCircle className="size-6 text-red-500 mb-1.5 stroke-[1.5]" /><p className="text-xs font-semibold text-red-500">{imageError}</p></>
                ) : (
                  <><Upload className="size-5 text-gray-400 mb-1.5" /><p className="text-xs font-semibold text-gray-700">{t('banners.form.uploadBannerImage', { defaultValue: 'Upload Image' })}</p><p className="text-[10px] text-gray-400">PNG, JPG, WEBP — Max 3MB</p></>
                )}
              </div>
            )}
          </div>

          {/* Link Type */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Link Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {LINK_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectLinkType(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    linkType === opt.value ? 'border-gray-900 bg-gray-950 text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Link Target */}
          {linkType !== 'EXTERNAL_URL' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-1.5 block">
                {linkType === 'CATEGORY' ? 'Select Category' : linkType === 'PRODUCT' ? 'Select Product' : 'Select Vendor'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  disabled={ddlLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>{ddlLoading ? 'Loading...' : `Choose a ${linkType.toLowerCase()}...`}</option>
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
                {ddlLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />}
              </div>
            </div>
          )}

          {/* External URL */}
          {linkType === 'EXTERNAL_URL' && (
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-1.5 block">External URL <span className="text-red-500">*</span></label>
              <div className="relative">
                <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/target"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>
          )}

          {/* Expiration Date */}
          <div>
            <label className="text-xs font-semibold text-gray-900 mb-1 block">Ends At</label>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all" />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('banners.form.bannerStatus', { defaultValue: 'Banner Status' })}</p>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">{t('banners.form.bannerStatusHint', { defaultValue: 'Active banners show on the home page.' })}</p>
            </div>
            <Toggle checked={isActive} onChange={handleToggleActive} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
            <button type="button" onClick={() => setViewMode('banners')}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg transition-colors cursor-pointer">
              {t('banners.form.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              {mode === 'add' ? t('banners.form.saveBanner', { defaultValue: 'Save Banner' }) : t('banners.form.saveChanges', { defaultValue: 'Save Changes' })}
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Enable Modal */}
      {confirmEnableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl border border-gray-100 relative">
            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{t('banners.enableModal.title', { defaultValue: 'Enable Banner' })}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                {t('banners.enableModal.message', { defaultValue: 'Are you sure you want to enable this banner? It will immediately be displayed on the platform home page.' })}
              </p>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button type="button" onClick={() => setConfirmEnableModalOpen(false)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer">
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="button" onClick={handleConfirmEnable}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer">
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
