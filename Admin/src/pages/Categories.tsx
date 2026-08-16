import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  ITEMS_PER_PAGE,
  useCategoryStore,
  useCategoriesData,
  CategoryHeader,
  CategoryFilterBar,
  CategoryFormModal,
  DeleteModal,
  StatusConfirmModal,
  CannotDeleteModal,
  CategoryTable,
  CategorySkeleton,
  MobileCard,
  Pagination,
  BulkNavbar,
  type Category,
} from '../features/categories';

// ─── Main Categories Page ──────────────────────────────────────────────────────
const Categories = () => {
  const { t, i18n } = useTranslation();
  const { isMobile } = useBreakpoint();

  // ── React Query Hook (Data Fetching & Mutations) ──
  const {
    categories,
    isLoading,
    createCategoryMutation,
    updateCategoryMutation,
    deactivateCategoryMutation,
    reactivateCategoryMutation,
    deleteCategoryMutation,
  } = useCategoriesData();

  // ── Store State (UI & Modals) ──
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
  const openCannotDeleteModal = useCategoryStore((s) => s.openCannotDeleteModal);
  const handleToggleActiveRequest = useCategoryStore((s) => s.handleToggleActiveRequest);

  // ── Mutation Action Handlers ──
  const handleSave = async (data: Omit<Category, 'id' | 'productsCount' | 'image'> & { image?: string | File | null }) => {
    if (formModal.mode === 'add') {
      await createCategoryMutation.mutateAsync({
        name: data.nameEn || data.name || data.nameAr || '',
        nameAr: data.nameAr || '',
        slug: data.slug,
        description: data.description || null,
        parentCategoryId: data.parentCategoryId || null,
        image: data.image !== undefined ? data.image : null,
      });
      closeForm();
    } else if (formModal.category) {
      const catId = formModal.category.id;
      const initialIsActive = formModal.category.isActive;

      await updateCategoryMutation.mutateAsync({
        id: catId,
        payload: {
          name: data.nameEn || data.name || data.nameAr || '',
          nameAr: data.nameAr || '',
          slug: data.slug,
          description: data.description || null,
          parentCategoryId: data.parentCategoryId || null,
          image: data.image !== undefined ? data.image : null,
          isActive: data.isActive,
        },
      });

      if (data.isActive !== initialIsActive) {
        if (data.isActive) {
          await reactivateCategoryMutation.mutateAsync(catId);
        } else {
          await deactivateCategoryMutation.mutateAsync(catId);
        }
      }

      closeForm();
    }
  };

  const handleStatusConfirm = async () => {
    if (statusModal.category) {
      const cat = statusModal.category;
      if (cat.isActive) {
        await deactivateCategoryMutation.mutateAsync(cat.id);
      } else {
        await reactivateCategoryMutation.mutateAsync(cat.id);
      }
      closeStatusModal();
    }
  };

  const handleDelete = async (lang: string) => {
    if (deleteModal.isBulk) {
      const selectedCats = categories.filter((c) => selectedIds.has(c.id));
      const hasProducts = selectedCats.some((c) => c.productsCount > 0);
      if (hasProducts) {
        closeDelete();
        openCannotDeleteModal({ isBulk: true });
        return;
      }
      for (const cat of selectedCats) {
        await deleteCategoryMutation.mutateAsync(cat.id);
      }
      clearSelection();
      closeDelete();
    } else if (deleteModal.category) {
      const cat = deleteModal.category;
      if (cat.productsCount > 0) {
        closeDelete();
        openCannotDeleteModal({
          isBulk: false,
          categoryName: lang === 'ar' ? cat.nameAr : cat.nameEn,
          productsCount: cat.productsCount,
        });
        return;
      }
      await deleteCategoryMutation.mutateAsync(cat.id);
      closeDelete();
    }
  };

  // ── Filtering & Pagination ──
  const filtered = useMemo(() => {
    let result = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
          (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.slug && c.slug.toLowerCase().includes(q))
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

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <>
      <div className="sidebar-page-container-header">
        <CategoryHeader />
      </div>
      <div
        className={`flex-1 overflow-y-auto pt-6 sidebar-page-container transition-all ${
          selectedIds.size > 0 ? 'pb-20' : 'pb-6'
        }`}
      >
        {/* Search & Filters */}
        <CategoryFilterBar />

        {/* Content */}
        {isLoading ? (
          <CategorySkeleton isMobile={isMobile} />
        ) : isMobile ? (
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
              <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-xs">
                <Tag size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">{t('categories.emptyState')}</p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden mt-3">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <CategoryTable
              categories={paginated}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onSelectAll={() => handleSelectAll(paginated.map((c) => c.id))}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggleActive={handleToggleActiveRequest}
            />

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
          isSubmitting={isSubmitting}
          onClose={closeForm}
          onSave={handleSave}
        />

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={deleteModal.open}
          categoryName={
            i18n.language === 'ar'
              ? deleteModal.category?.nameAr ?? ''
              : deleteModal.category?.nameEn ?? deleteModal.category?.name ?? ''
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
              : statusModal.category?.nameEn ?? statusModal.category?.name ?? ''
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
