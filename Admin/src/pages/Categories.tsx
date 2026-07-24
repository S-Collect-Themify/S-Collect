import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  ITEMS_PER_PAGE,
  useCategoryStore,
  CategoryHeader,
  CategoryFilterBar,
  CategoryFormModal,
  DeleteModal,
  StatusConfirmModal,
  CannotDeleteModal,
  CategoryTable,
  MobileCard,
  Pagination,
  BulkNavbar,
} from '../features/categories';

// ─── Main Categories Page ──────────────────────────────────────────────────────
const Categories = () => {
  const { t, i18n } = useTranslation();
  const { isMobile } = useBreakpoint();

  // ── Store State ──
  const categories = useCategoryStore((s) => s.categories);
  const search = useCategoryStore((s) => s.search);
  const categoryFilter = useCategoryStore((s) => s.categoryFilter);
  const currentPage = useCategoryStore((s) => s.currentPage);
  const selectedIds = useCategoryStore((s) => s.selectedIds);

  const formModal = useCategoryStore((s) => s.formModal);
  const deleteModal = useCategoryStore((s) => s.deleteModal);
  const statusModal = useCategoryStore((s) => s.statusModal);
  const cannotDeleteModal = useCategoryStore((s) => s.cannotDeleteModal);

  // ── Store Actions ──
  const setCurrentPage = useCategoryStore((s) => s.setCurrentPage);
  const handleSelectOne = useCategoryStore((s) => s.handleSelectOne);
  const handleSelectAll = useCategoryStore((s) => s.handleSelectAll);
  const clearSelection = useCategoryStore((s) => s.clearSelection);

  const openEdit = useCategoryStore((s) => s.openEdit);
  const openDelete = useCategoryStore((s) => s.openDelete);
  const openBulkDelete = useCategoryStore((s) => s.openBulkDelete);
  const closeForm = useCategoryStore((s) => s.closeForm);
  const closeDelete = useCategoryStore((s) => s.closeDelete);
  const closeStatusModal = useCategoryStore((s) => s.closeStatusModal);
  const closeCannotDeleteModal = useCategoryStore((s) => s.closeCannotDeleteModal);

  const handleSave = useCategoryStore((s) => s.handleSave);
  const handleDelete = useCategoryStore((s) => s.handleDelete);
  const handleToggleActiveRequest = useCategoryStore((s) => s.handleToggleActiveRequest);
  const handleStatusConfirm = useCategoryStore((s) => s.handleStatusConfirm);
  const reorderCategories = useCategoryStore((s) => s.reorderCategories);

  // ── Filtering & Pagination ──
  const filtered = useMemo(() => {
    let result = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.nameEn.toLowerCase().includes(q) ||
          c.nameAr.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.id === categoryFilter);
    }
    return result;
  }, [categories, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // ── Drag & Drop ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      reorderCategories(oldIndex, newIndex);
    }
  };

  return (
    <>
    <div  className='sidebar-page-container-header' >

      <CategoryHeader />
    </div>
    <div className={`flex-1 overflow-y-auto pt-6 sidebar-page-container transition-all ${selectedIds.size > 0 ? 'pb-20' : 'pb-6'}`}>
      {/* Page Header */}

      {/* Search & Filters */}
      <CategoryFilterBar />

      {/* Content */}
      {isMobile ? (
        <div className="space-y-3">
          <AnimatePresence>
            {paginated.map((cat) => (
              <MobileCard
                key={cat.id}
                category={cat}
                selected={selectedIds.has(cat.id)}
                onSelect={() => handleSelectOne(cat.id)}
                onEdit={openEdit}
                onDelete={openDelete}
                onToggleActive={handleToggleActiveRequest}
              />
            ))}
          </AnimatePresence>

          {paginated.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Tag size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">{t('categories.emptyState')}</p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <CategoryTable
              categories={paginated}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onSelectAll={() => handleSelectAll(paginated.map((c) => c.id))}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggleActive={handleToggleActiveRequest}
            />
          </DndContext>

          {filtered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Bulk Delete Bottom Navbar */}
      <BulkNavbar
        selectedCount={selectedIds.size}
        onDelete={openBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Add / Edit Modal */}
      <CategoryFormModal
        key={formModal.open ? (formModal.category?.id ?? 'add-new') : 'closed'}
        isOpen={formModal.open}
        mode={formModal.mode}
        category={formModal.category}
        categories={categories}
        onClose={closeForm}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        categoryName={
          i18n.language === 'ar'
            ? deleteModal.category?.nameAr ?? ''
            : deleteModal.category?.nameEn ?? ''
        }
        count={deleteModal.isBulk ? selectedIds.size : undefined}
        onClose={closeDelete}
        onConfirm={() => handleDelete(i18n.language)}
      />

      {/* Status Confirmation Modal */}
      <StatusConfirmModal
        isOpen={statusModal.open}
        categoryName={
          i18n.language === 'ar'
            ? statusModal.category?.nameAr ?? ''
            : statusModal.category?.nameEn ?? ''
        }
        currentStatus={statusModal.category?.isActive ?? false}
        onClose={closeStatusModal}
        onConfirm={handleStatusConfirm}
      />

      {/* Cannot Delete Modal */}
      <CannotDeleteModal
        isOpen={cannotDeleteModal.open}
        isBulk={cannotDeleteModal.isBulk}
        categoryName={cannotDeleteModal.categoryName}
        productsCount={cannotDeleteModal.productsCount}
        onClose={closeCannotDeleteModal}
      />
    </div>
    </>

  );
};

export default Categories;
