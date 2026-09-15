import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFaqCategoriesQuery, useFaqMutations } from '../useStaticPagesData';
import { useStaticPagesStore } from '../staticPagesStore';
import { FaqCategoryCard } from './FaqCategoryCard';
import { FaqCategoryFormModal } from './FaqCategoryFormModal';
import { FaqItemFormModal } from './FaqItemFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import type { Bilingual, FaqCategory, FaqItem } from '../types';

type DragHandleProps = {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
};

interface SortableCategoryWrapperProps {
  category: FaqCategory;
  children: (dragHandleProps: DragHandleProps) => ReactNode;
}

const SortableCategoryWrapper = ({ category, children }: SortableCategoryWrapperProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
};

export const FaqManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: categories, isLoading } = useFaqCategoriesQuery();

  const {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    reorderItemsMutation,
    reorderCategoriesMutation,
  } = useFaqMutations();

  const deleteFaqItemModal = useStaticPagesStore((s) => s.deleteFaqItemModal);
  const deleteFaqCategoryModal = useStaticPagesStore((s) => s.deleteFaqCategoryModal);
  const openDeleteFaqItemModal = useStaticPagesStore((s) => s.openDeleteFaqItemModal);
  const closeDeleteFaqItemModal = useStaticPagesStore((s) => s.closeDeleteFaqItemModal);
  const openDeleteFaqCategoryModal = useStaticPagesStore((s) => s.openDeleteFaqCategoryModal);
  const closeDeleteFaqCategoryModal = useStaticPagesStore((s) => s.closeDeleteFaqCategoryModal);

  const [localCategories, setLocalCategories] = useState<FaqCategory[]>(categories || []);
  useEffect(() => {
    if (categories) setLocalCategories(categories);
  }, [categories]);

  const [categoryModal, setCategoryModal] = useState<{ open: boolean; mode: 'add' | 'edit'; category: FaqCategory | null }>({
    open: false,
    mode: 'add',
    category: null,
  });

  const [itemModal, setItemModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    categoryId: string | null;
    item: FaqItem | null;
  }>({ open: false, mode: 'add', categoryId: null, item: null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localCategories.findIndex((c) => c.id === active.id);
      const newIndex = localCategories.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(localCategories, oldIndex, newIndex);
        setLocalCategories(reordered);
        reorderCategoriesMutation.mutate(reordered);
      }
    }
  };

  const handleCategorySubmit = (name: Bilingual) => {
    if (categoryModal.mode === 'add') {
      createCategoryMutation.mutate(name, { onSuccess: () => setCategoryModal({ open: false, mode: 'add', category: null }) });
    } else if (categoryModal.category) {
      updateCategoryMutation.mutate(
        { id: categoryModal.category.id, name },
        { onSuccess: () => setCategoryModal({ open: false, mode: 'add', category: null }) }
      );
    }
  };

  const handleItemSubmit = (payload: { question: Bilingual; answer: Bilingual }) => {
    if (!itemModal.categoryId) return;
    if (itemModal.mode === 'add') {
      createItemMutation.mutate(
        { categoryId: itemModal.categoryId, ...payload },
        { onSuccess: () => setItemModal({ open: false, mode: 'add', categoryId: null, item: null }) }
      );
    } else if (itemModal.item) {
      updateItemMutation.mutate(
        { categoryId: itemModal.categoryId, itemId: itemModal.item.id, ...payload },
        { onSuccess: () => setItemModal({ open: false, mode: 'add', categoryId: null, item: null }) }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-10 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {t('staticPages.faq.description', 'Organize frequently asked questions into categories shown on the storefront FAQ page.')}
        </p>
        <button
          type="button"
          onClick={() => setCategoryModal({ open: true, mode: 'add', category: null })}
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={16} />
          {t('staticPages.faq.addCategoryButton', 'Add Category')}
        </button>
      </div>

      {localCategories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-10 text-center text-sm text-gray-400">
          {t('staticPages.faq.noCategories', 'No FAQ categories yet. Add your first category to get started.')}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={localCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {localCategories.map((category) => (
                <SortableCategoryWrapper key={category.id} category={category}>
                  {(dragHandleProps) => (
                    <FaqCategoryCard
                      category={category}
                      dragHandleProps={dragHandleProps}
                      onEditCategory={() => setCategoryModal({ open: true, mode: 'edit', category })}
                      onDeleteCategory={() => openDeleteFaqCategoryModal(category)}
                      onAddItem={() => setItemModal({ open: true, mode: 'add', categoryId: category.id, item: null })}
                      onEditItem={(item) => setItemModal({ open: true, mode: 'edit', categoryId: category.id, item })}
                      onDeleteItem={(item) => openDeleteFaqItemModal(category.id, item)}
                      onReorderItems={(items) => reorderItemsMutation.mutate({ categoryId: category.id, items })}
                    />
                  )}
                </SortableCategoryWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit category modal */}
      <FaqCategoryFormModal
        isOpen={categoryModal.open}
        mode={categoryModal.mode}
        category={categoryModal.category}
        isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        onClose={() => setCategoryModal({ open: false, mode: 'add', category: null })}
        onSubmit={handleCategorySubmit}
      />

      {/* Add / Edit item modal */}
      <FaqItemFormModal
        isOpen={itemModal.open}
        mode={itemModal.mode}
        item={itemModal.item}
        isPending={createItemMutation.isPending || updateItemMutation.isPending}
        onClose={() => setItemModal({ open: false, mode: 'add', categoryId: null, item: null })}
        onSubmit={handleItemSubmit}
      />

      {/* Delete category confirm */}
      <ConfirmDeleteModal
        isOpen={deleteFaqCategoryModal.open}
        title={t('staticPages.faq.deleteCategoryTitle', 'Delete Category')}
        message={t('staticPages.faq.deleteCategoryMessage', {
          defaultValue: 'Are you sure you want to delete "{{name}}"? All its questions will be removed too.',
          name:
            (isAr
              ? deleteFaqCategoryModal.category?.name.ar
              : deleteFaqCategoryModal.category?.name.en) || '',
        })}
        isPending={deleteCategoryMutation.isPending}
        onClose={closeDeleteFaqCategoryModal}
        onConfirm={() => {
          if (deleteFaqCategoryModal.category) {
            deleteCategoryMutation.mutate(deleteFaqCategoryModal.category.id);
          }
        }}
      />

      {/* Delete item confirm */}
      <ConfirmDeleteModal
        isOpen={deleteFaqItemModal.open}
        title={t('staticPages.faq.deleteItemTitle', 'Delete Question')}
        message={t('staticPages.faq.deleteItemMessage', {
          defaultValue: 'Are you sure you want to delete this question? This action cannot be undone.',
        })}
        isPending={deleteItemMutation.isPending}
        onClose={closeDeleteFaqItemModal}
        onConfirm={() => {
          if (deleteFaqItemModal.categoryId && deleteFaqItemModal.item) {
            deleteItemMutation.mutate({
              categoryId: deleteFaqItemModal.categoryId,
              itemId: deleteFaqItemModal.item.id,
            });
          }
        }}
      />
    </div>
  );
};
