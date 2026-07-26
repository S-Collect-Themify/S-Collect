import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  SquarePen,
  Trash2,
  Plus,
  GripVertical,
  ChevronRight,
  ChevronLeft,
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
import type { BannerItem } from '../types';

interface SortableBannerRowProps {
  banner: BannerItem;
  order: number;
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const SortableBannerRow: React.FC<SortableBannerRowProps> = ({
  banner,
  order,
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

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Order column */}
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

      {/* Thumbnail column */}
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

      {/* Banner Title column */}
      <td className="py-4 px-6 font-semibold text-gray-900 text-sm">
        {banner.name}
      </td>

      {/* Redirect link column */}
      <td className="py-4 px-6 text-gray-500 font-normal">
        <a
          href={banner.redirectUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:underline hover:text-black transition-colors text-sm"
        >
          {banner.redirectUrl}
        </a>
      </td>

      {/* Status column */}
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

      {/* Actions column */}
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

export const BannersList: React.FC = () => {
  const { t } = useTranslation();
  const {
    banners,
    setViewMode,
    setEditingBanner,
    openDeleteModal,
    reorderBanners,
  } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

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
      }
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

      {/* Table Card (Full Width) */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 overflow-hidden w-full">
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
                    {t('banners.table.redirectLink', {
                      defaultValue: 'Redirect Link',
                    })}
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
                        colSpan={6}
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
      </div>
    </div>
  );
};
