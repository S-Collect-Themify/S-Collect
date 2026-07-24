import React from 'react';
import { useTranslation } from 'react-i18next';
import { SquarePen, Trash2, Plus, ArrowLeft, GripVertical } from 'lucide-react';
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
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const SortableBannerRow: React.FC<SortableBannerRowProps> = ({
  banner,
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
      {/* Drag handle */}
      <td className="py-4 px-3 w-10 text-gray-400">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </td>

      {/* Name column */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
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
          <span className="font-semibold text-gray-900">{banner.name}</span>
        </div>
      </td>

      {/* Redirect link column */}
      <td className="py-4 px-6 text-gray-500 font-normal">
        <a
          href={banner.redirectUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:underline hover:text-black transition-colors"
        >
          {banner.redirectUrl}
        </a>
      </td>

      {/* Role / Status column */}
      <td className="py-4 px-6">
        {banner.isActive ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
            {t('banners.status.active', { defaultValue: 'Active' })}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500">
            {t('banners.status.inactive', { defaultValue: 'Inactive' })}
          </span>
        )}
      </td>

      {/* Date added column */}
      <td className="py-4 px-6 text-gray-500">{banner.dateAdded}</td>

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
  const { banners, setViewMode, setEditingBanner, openDeleteModal, reorderBanners } =
    useAdminSettingsStore();

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title={t('adminSettings.backToSettings', { defaultValue: 'Back to Settings' })}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('banners.title', { defaultValue: 'Banners' })}
          </h1>
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
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-600">
                  <th className="py-4 px-3 w-10"></th>
                  <th className="py-4 px-4 font-semibold">
                    {t('banners.table.name', { defaultValue: 'Name' })}
                  </th>
                  <th className="py-4 px-6 font-semibold">
                    {t('banners.table.redirectLink', { defaultValue: 'Redirect Link' })}
                  </th>
                  <th className="py-4 px-6 font-semibold">
                    {t('banners.table.role', { defaultValue: 'Role' })}
                  </th>
                  <th className="py-4 px-6 font-semibold">
                    {t('banners.table.dateAdded', { defaultValue: 'Date Added' })}
                  </th>
                  <th className="py-4 px-6 font-semibold text-right rtl:text-left">
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
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        {t('banners.noBanners', { defaultValue: 'No banners added yet.' })}
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner) => (
                      <SortableBannerRow
                        key={banner.id}
                        banner={banner}
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
