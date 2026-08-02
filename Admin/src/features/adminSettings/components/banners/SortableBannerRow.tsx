import React from 'react';
import { SquarePen, Trash2, GripVertical, Tag, Package, Store, ExternalLink } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BannerItem, BannerLinkType } from '../../types';

export const LINK_TYPE_CONFIG: Record<BannerLinkType, { label: string; icon: React.ReactNode; color: string }> = {
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

export interface SortableBannerRowProps {
  banner: BannerItem;
  order: number;
  categoryMap: Map<string, string>;
  productMap: Map<string, string>;
  vendorMap: Map<string, string>;
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const SortableBannerRow: React.FC<SortableBannerRowProps> = ({
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
            title={t('banners.edit', { defaultValue: 'Edit Banner' })}
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
