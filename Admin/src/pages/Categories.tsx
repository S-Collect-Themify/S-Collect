import { useMemo, useEffect } from 'react';
import { Tag, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
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
  CategorySkeleton,
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
  const isLoading = useCategoryStore((s) => s.isLoading);
  const error = useCategoryStore((s) => s.error);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

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

  // ── Fetch Categories from API on mount ──
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
        ) : error && categories.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={() => fetchCategories()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
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
