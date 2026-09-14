import { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCategoryStore,
  useCategoriesData,
  CategoryHeader,
  CategoryFilterBar,
  CategoryFormModal,
  DeleteModal,
  StatusConfirmModal,
  CannotDeleteModal,
  CategoryTree,
  CategorySkeleton,
  BulkNavbar,
  filterCategoryTree,
  type Category,
} from '../features/categories';
import { BulkDiscountModal, type BulkDiscountFormData } from '../features/products';

// ─── Main Categories Page ──────────────────────────────────────────────────────
const Categories = () => {
  const { i18n } = useTranslation();

  // ── React Query Hook (Data Fetching & Mutations) ──
  const {
    tree,
    categories,
    orphans,
    isLoading,
    createCategoryMutation,
    updateCategoryMutation,
    deactivateCategoryMutation,
    reactivateCategoryMutation,
    deleteCategoryMutation,
    applyBulkDiscountMutation,
  } = useCategoriesData();

  // ── Store State (UI & Modals) ──
  const search = useCategoryStore((s) => s.search);
  const departmentFilter = useCategoryStore((s) => s.departmentFilter);
  const selectedIds = useCategoryStore((s) => s.selectedIds);
  const expandedIds = useCategoryStore((s) => s.expandedIds);

  const formModal = useCategoryStore((s) => s.formModal);
  const deleteModal = useCategoryStore((s) => s.deleteModal);
  const statusModal = useCategoryStore((s) => s.statusModal);
  const cannotDeleteModal = useCategoryStore((s) => s.cannotDeleteModal);
  const discountModal = useCategoryStore((s) => s.discountModal);

  // ── Store Actions ──
  const handleSelectOne = useCategoryStore((s) => s.handleSelectOne);
  const clearSelection = useCategoryStore((s) => s.clearSelection);
  const toggleExpanded = useCategoryStore((s) => s.toggleExpanded);
  const expandIds = useCategoryStore((s) => s.expandIds);

  const openAdd = useCategoryStore((s) => s.openAdd);
  const openEdit = useCategoryStore((s) => s.openEdit);
  const openDelete = useCategoryStore((s) => s.openDelete);
  const openBulkDelete = useCategoryStore((s) => s.openBulkDelete);
  const openDiscountModal = useCategoryStore((s) => s.openDiscountModal);
  const closeDiscountModal = useCategoryStore((s) => s.closeDiscountModal);
  const closeForm = useCategoryStore((s) => s.closeForm);
  const closeDelete = useCategoryStore((s) => s.closeDelete);
  const closeStatusModal = useCategoryStore((s) => s.closeStatusModal);
  const closeCannotDeleteModal = useCategoryStore((s) => s.closeCannotDeleteModal);
  const openCannotDeleteModal = useCategoryStore((s) => s.openCannotDeleteModal);
  const handleToggleActiveRequest = useCategoryStore((s) => s.handleToggleActiveRequest);

  // ── Expand all Departments by default once the tree first loads ──
  const didInitExpand = useRef(false);
  useEffect(() => {
    if (!didInitExpand.current && tree.length > 0) {
      expandIds(tree.map((d) => d.id));
      didInitExpand.current = true;
    }
  }, [tree, expandIds]);

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

  const handleApplyDiscountSubmit = async (data: BulkDiscountFormData) => {
    const selectedCatId = Array.from(selectedIds)[0];
    if (!selectedCatId) return;

    await applyBulkDiscountMutation.mutateAsync({
      categoryId: selectedCatId,
      discountType: data.discountType,
      discountValue: data.discountValue,
      expiryDate: data.expiryDate,
    });

    closeDiscountModal();
    clearSelection();
  };

  // ── Filtering (Department + Search) ──
  const visibleTree = useMemo(() => {
    const byDepartment =
      departmentFilter === 'all' ? tree : tree.filter((d) => d.id === departmentFilter);
    return filterCategoryTree(byDepartment, search);
  }, [tree, departmentFilter, search]);

  // Orphans have no department, so they're only affected by search (and hidden
  // entirely when a specific department is selected, since they can't match one).
  const visibleOrphans = useMemo(() => {
    if (departmentFilter !== 'all') return [];
    const q = search.trim().toLowerCase();
    if (!q) return orphans;
    return orphans.filter(
      (c) => c.nameEn.toLowerCase().includes(q) || c.nameAr.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [orphans, departmentFilter, search]);

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
          <CategorySkeleton isMobile={false} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <CategoryTree
              tree={visibleTree}
              orphans={visibleOrphans}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              forceExpandAll={search.trim().length > 0}
              onToggleExpand={toggleExpanded}
              onSelectOne={handleSelectOne}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggleActive={handleToggleActiveRequest}
              onAddCategory={(departmentId) => openAdd({ level: 1, parentId: departmentId })}
              onAddSubCategory={(categoryId) => openAdd({ level: 2, parentId: categoryId })}
            />
          </div>
        )}

        {/* Bulk Delete Bottom Navbar */}
        <BulkNavbar
          selectedCount={selectedIds.size}
          onDelete={openBulkDelete}
          onApplyDiscount={openDiscountModal}
          onClearSelection={clearSelection}
        />

        {/* Bulk Discount Modal */}
        <BulkDiscountModal
          isOpen={discountModal.open}
          selectedCount={selectedIds.size}
          onClose={closeDiscountModal}
          onSubmit={handleApplyDiscountSubmit}
          isPending={applyBulkDiscountMutation.isPending}
          title={i18n.language === 'ar' ? 'خصم جماعي للفئة' : 'Category Bulk Discount'}
          subtitle={
            i18n.language === 'ar'
              ? 'تطبيق خصم على منتجات الفئة المحددة'
              : 'Apply discount on products in selected category'
          }
        />

        {/* Add / Edit Modal */}
        <CategoryFormModal
          key={formModal.open ? (formModal.category?.id ?? `add-${formModal.level}-${formModal.parentId ?? ''}`) : 'closed'}
          isOpen={formModal.open}
          mode={formModal.mode}
          category={formModal.category}
          categories={categories}
          initialLevel={formModal.level}
          initialParentId={formModal.parentId}
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
