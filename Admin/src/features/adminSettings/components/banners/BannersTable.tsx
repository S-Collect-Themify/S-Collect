import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { BannerItem } from '../../types';
import { SortableBannerRow } from './SortableBannerRow';
import { BannersSkeleton } from '../skeletons/BannersSkeleton';

export interface BannersTableProps {
  banners: BannerItem[];
  bannersLoading: boolean;
  isSuperAdmin?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<SensorOptions>[] | any;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (banner: BannerItem) => void;
  onDelete: (banner: BannerItem) => void;
}

export const BannersTable: React.FC<BannersTableProps> = ({
  banners,
  bannersLoading,
  isSuperAdmin = true,
  sensors,
  onDragEnd,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 overflow-hidden w-full">
      {bannersLoading ? (
        <BannersSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-separate border-spacing-y-0">
              <thead>
                <tr className="bg-[#f8f9fa] text-xs font-medium text-gray-500">
                  <th className="py-3 px-4 first:rounded-l-xl font-medium text-left rtl:text-right">
                    {t('banners.table.order', { defaultValue: 'Order' })}
                  </th>
                  <th className="py-3 px-4 font-medium text-left rtl:text-right">
                    {t('banners.table.thumbnail', { defaultValue: 'Thumbnail' })}
                  </th>
                  <th className="py-3 px-6 font-medium text-left rtl:text-right">
                    {t('banners.table.title', { defaultValue: 'Banner Title' })}
                  </th>
                  <th className="py-3 px-6 font-medium text-left rtl:text-right">
                    {t('banners.table.linkType', { defaultValue: 'Link Type' })}
                  </th>
                  <th className={`py-3 px-6 font-medium text-left rtl:text-right ${!isSuperAdmin ? 'last:rounded-r-xl' : ''}`}>
                    {t('banners.table.status', { defaultValue: 'Status' })}
                  </th>
                  {isSuperAdmin && (
                    <th className="py-3 px-6 last:rounded-r-xl font-medium text-right rtl:text-left">
                      {t('banners.table.actions', { defaultValue: 'Actions' })}
                    </th>
                  )}
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
                        colSpan={isSuperAdmin ? 6 : 5}
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
                        isSuperAdmin={isSuperAdmin}
                        onEdit={onEdit}
                        onDelete={onDelete}
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
  );
};
