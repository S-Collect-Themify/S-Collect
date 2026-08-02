import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SquarePen,
  Trash2,
  Plus,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Tag,
  Package,
  Store,
  ExternalLink,
  RefreshCw,
  Save,
  Loader2,
} from 'lucide-react';
import i18n from '../../../i18n';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAdminSettingsStore } from '../store';
import type { BannerItem, BannerLinkType } from '../types';
import { getAdminCategories, type ApiCategoryItem } from '../../../services/categories';
import { getVendors, type BackendVendor } from '../../../services/vendors';
import { getAllProducts } from '../../../services/products';

// ─── Link Type Badge ───────────────────────────────────────────────────────────
const LINK_TYPE_CONFIG: Record<BannerLinkType, { label: string; icon: React.ReactNode; color: string }> = {
  CATEGORY: {
    label: 'Category',
    icon: <Tag size={11} />,
    color: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  PRODUCT: {
    label: 'Product',
    icon: <Package size={11} />,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  VENDOR: {
    label: 'Vendor',
    icon: <Store size={11} />,
    color: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  EXTERNAL_URL: {
    label: 'External',
    icon: <ExternalLink size={11} />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
};

// ─── Sortable Banner Row ───────────────────────────────────────────────────────
interface SortableBannerRowProps {
  banner: BannerItem;
  order: number;
  categoryMap: Map<string, string>;
  productMap: Map<string, string>;
  vendorMap: Map<string, string>;
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const SortableBannerRow: React.FC<SortableBannerRowProps> = ({
  banner,
  order,
  categoryMap,
  productMap,
  vendorMap,
  onEdit,
  onDelete,
  t,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    backgroundColor: isDragging ? '#f9fafb' : undefined,
  };

  const linkCfg = banner.linkType ? LINK_TYPE_CONFIG[banner.linkType] : null;

  // Resolve human readable name for linkTargetId
  const getTargetDisplay = () => {
    if (banner.linkType === 'EXTERNAL_URL') {
      const url = banner.externalUrl || banner.redirectUrl;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="hover:underline hover:text-black transition-colors text-sm truncate block"
        >
          {url}
        </a>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      );
    }

    if (banner.linkType === 'CATEGORY' && banner.linkTargetId) {
      const catName = categoryMap.get(banner.linkTargetId) || banner.linkTargetId;
      return <span className="text-sm font-medium text-gray-800 truncate block">{catName}</span>;
    }

    if (banner.linkType === 'PRODUCT' && banner.linkTargetId) {
      const prodName = productMap.get(banner.linkTargetId) || banner.linkTargetId;
      return <span className="text-sm font-medium text-gray-800 truncate block">{prodName}</span>;
    }

    if (banner.linkType === 'VENDOR' && banner.linkTargetId) {
      const venName = vendorMap.get(banner.linkTargetId) || banner.linkTargetId;
      return <span className="text-sm font-medium text-gray-800 truncate block">{venName}</span>;
    }

    // Fallback if target ID or external URL
    const fallback = banner.externalUrl || banner.redirectUrl || banner.linkTargetId;
    return fallback ? (
      <span className="text-sm text-gray-700 truncate block">{fallback}</span>
    ) : (
      <span className="text-xs text-gray-300">—</span>
    );
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Order */}
      <td className="py-4 px-4 text-gray-500 font-medium text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <span>{order}</span>
        </div>
      </td>

      {/* Thumbnail */}
      <td className="py-4 px-4">
        <div className="w-36 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80 shadow-2xs">
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-gray-400 text-xs font-medium">
              No Img
            </div>
          )}
        </div>
      </td>

      {/* Title */}
      <td className="py-4 px-6 font-semibold text-gray-900 text-sm">
        {banner.name}
      </td>

      {/* Link Type */}
      <td className="py-4 px-6">
        {linkCfg ? (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${linkCfg.color}`}>
            {linkCfg.icon}
            {linkCfg.label}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Redirect link / Target Name */}
      <td className="py-4 px-6 text-gray-700 font-normal max-w-xs">
        {getTargetDisplay()}
      </td>

      {/* Status */}
      <td className="py-4 px-6">
        {banner.isActive ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
            {t('banners.status.active', { defaultValue: 'Active' })}
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100/50">
            {t('banners.status.inactive', { defaultValue: 'Inactive' })}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="py-4 px-6 text-right rtl:text-left">
        <div className="flex items-center justify-end rtl:justify-start gap-2">
          <button
            type="button"
            onClick={() => onEdit(banner)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
            title={t('banners.edit.title', { defaultValue: 'Edit Banner' })}
          >
            <SquarePen size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(banner)}
            className="p-1.5 rounded-lg border border-red-100 bg-red-50/40 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
            title={t('banners.delete', { defaultValue: 'Delete Banner' })}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Banners List ──────────────────────────────────────────────────────────────
export const BannersList: React.FC = () => {
  const { t } = useTranslation();
  const {
    banners,
    bannersLoading,
    bannersError,
    fetchBanners,
    saveBannersOrderApi,
    setViewMode,
    setEditingBanner,
    openDeleteModal,
    reorderBanners,
  } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const [categories, setCategories] = useState<ApiCategoryItem[]>([]);
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; nameEn?: string }[]>([]);
  const [hasReordered, setHasReordered] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Fetch banners and related entities on mount
  useEffect(() => {
    fetchBanners();
    const loadLookups = async () => {
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
        // ignore
      }
    };
    loadLookups();
  }, [fetchBanners]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name || c.nameEn || c.nameAr || ''])), [categories]);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p.nameEn || p.name || ''])), [products]);
  const vendorMap = useMemo(() => new Map(vendors.map((v) => [v.id, v.storeName || ''])), [vendors]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setViewMode('banners-edit');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBanners(oldIndex, newIndex);
        setHasReordered(true);
      }
    }
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const success = await saveBannersOrderApi();
      if (success) {
        setHasReordered(false);
      }
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t('banners.title', { defaultValue: 'Banners' })}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <button
              type="button"
              onClick={() => setViewMode('settings')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
            </button>
            <ChevronIcon size={12} />
            <span className="text-gray-900 font-semibold">
              {t('banners.title', { defaultValue: 'Banners' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchBanners()}
            disabled={bannersLoading}
            title="Refresh banners"
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={bannersLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setViewMode('banners-add');
            }}
            className="bg-black hover:bg-gray-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            {t('banners.addNewBanner', { defaultValue: 'Add New Banner' })}
          </button>
        </div>
      </div>

      {/* Error State */}
      {bannersError && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          {bannersError}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 overflow-hidden w-full">
        {bannersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-36 h-14 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-100 rounded-lg animate-pulse" />
                <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-16 h-6 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-0">
                <thead>
                  <tr className="bg-[#f8f9fa] text-xs font-medium text-gray-500">
                    <th className="py-3 px-4 first:rounded-l-xl font-medium">
                      {t('banners.table.order', { defaultValue: 'Order' })}
                    </th>
                    <th className="py-3 px-4 font-medium">
                      {t('banners.table.thumbnail', { defaultValue: 'Thumbnail' })}
                    </th>
                    <th className="py-3 px-6 font-medium">
                      {t('banners.table.title', { defaultValue: 'Banner Title' })}
                    </th>
                    <th className="py-3 px-6 font-medium">
                      {t('banners.table.linkType', { defaultValue: 'Link Type' })}
                    </th>
                    <th className="py-3 px-6 font-medium">
                      {t('banners.table.redirectLink', { defaultValue: 'Link Target' })}
                    </th>
                    <th className="py-3 px-6 font-medium">
                      {t('banners.table.status', { defaultValue: 'Status' })}
                    </th>
                    <th className="py-3 px-6 last:rounded-r-xl font-medium text-right rtl:text-left">
                      {t('banners.table.actions', { defaultValue: 'Actions' })}
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={banners.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {banners.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-gray-400"
                        >
                          {t('banners.noBanners', {
                            defaultValue: 'No banners added yet.',
                          })}
                        </td>
                      </tr>
                    ) : (
                      banners.map((banner, index) => (
                        <SortableBannerRow
                          key={banner.id}
                          banner={banner}
                          order={index + 1}
                          categoryMap={categoryMap}
                          productMap={productMap}
                          vendorMap={vendorMap}
                          onEdit={handleEdit}
                          onDelete={openDeleteModal}
                          t={t}
                        />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </div>
          </DndContext>
        )}
      </div>

      {/* Save Order Banner */}
      {hasReordered && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-amber-900 text-sm font-semibold">
            <Save size={18} className="text-amber-600" />
            <span>
              {isArabic
                ? 'لقد قمت بتغيير ترتيب البنرات. انقر على حفظ الترتيب لتطبيق التغييرات.'
                : 'You have reordered the banners. Click save order to apply changes.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSavingOrder}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
          >
            {isSavingOrder ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isArabic ? 'حفظ الترتيب' : 'Save Banner Order'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
