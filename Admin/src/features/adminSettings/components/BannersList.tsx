import React, { useState, useEffect } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useAdminSettingsStore } from '../store';
import type { BannerItem } from '../types';
import { useBannersData } from '../hooks/useBannersData';
import { BannersHeader } from './banners/BannersHeader';
import { BannersTable } from './banners/BannersTable';
import { SaveOrderBanner } from './banners/SaveOrderBanner';

export const BannersList: React.FC = () => {
  const { setViewMode, setEditingBanner, openDeleteModal } = useAdminSettingsStore();

  // Remote state management via React Query hooks
  const {
    banners,
    isLoading: bannersLoading,
    isError,
    error,
    refetch,
    saveOrderMutation,
  } = useBannersData();

  // Local reordering state
  const [localBanners, setLocalBanners] = useState<BannerItem[]>([]);
  const [hasReordered, setHasReordered] = useState(false);

  // Sync local banners with query data when not currently reordering
  useEffect(() => {
    if (!hasReordered) {
      setLocalBanners(banners);
    }
  }, [banners, hasReordered]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setViewMode('banners-edit');
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setViewMode('banners-add');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localBanners.findIndex((b) => b.id === active.id);
      const newIndex = localBanners.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalBanners((prev) => arrayMove(prev, oldIndex, newIndex));
        setHasReordered(true);
      }
    }
  };

  const handleSaveOrder = async () => {
    try {
      await saveOrderMutation.mutateAsync(localBanners);
      setHasReordered(false);
    } catch {
      // Error handled in mutation onError
    }
  };

  const errorMessage = isError
    ? (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to load banners'
    : null;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <BannersHeader
        bannersLoading={bannersLoading}
        onRefresh={() => {
          setHasReordered(false);
          refetch();
        }}
        onAddNew={handleAddNew}
        onNavigateSettings={() => setViewMode('settings')}
      />

      {/* Error State */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          {errorMessage}
        </div>
      )}

      {/* Table Card */}
      <BannersTable
        banners={localBanners}
        bannersLoading={bannersLoading}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
      />

      {/* Save Order Banner */}
      {hasReordered && (
        <SaveOrderBanner
          isSavingOrder={saveOrderMutation.isPending}
          onSaveOrder={handleSaveOrder}
        />
      )}
    </div>
  );
};
