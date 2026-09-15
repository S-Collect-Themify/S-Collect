import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, SquarePen, Trash2, Plus } from 'lucide-react';
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
import { FaqItemRow } from './FaqItemRow';
import type { FaqCategory, FaqItem } from '../types';

interface FaqCategoryCardProps {
  category: FaqCategory;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddItem: () => void;
  onEditItem: (item: FaqItem) => void;
  onDeleteItem: (item: FaqItem) => void;
  onReorderItems: (items: FaqItem[]) => void;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes'];
    listeners: ReturnType<typeof useSortable>['listeners'];
  };
}

export const FaqCategoryCard = ({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  dragHandleProps,
}: FaqCategoryCardProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [localItems, setLocalItems] = useState<FaqItem[]>(category.items);

  useEffect(() => {
    setLocalItems(category.items);
  }, [category.items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((it) => it.id === active.id);
      const newIndex = localItems.findIndex((it) => it.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(reordered);
        onReorderItems(reordered);
      }
    }
  };

  const categoryName = isAr ? category.name.ar || category.name.en : category.name.en || category.name.ar;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors rounded shrink-0"
          >
            <GripVertical size={16} />
          </button>
        )}

        <h3 className="text-sm font-bold text-gray-900 flex-1 truncate">
          {categoryName || '—'}
        </h3>

        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {category.items.length} {t('staticPages.faq.questionsCount', 'questions')}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEditCategory}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
            title={t('staticPages.faq.editCategoryTitle', 'Edit FAQ Category')}
          >
            <SquarePen size={15} />
          </button>
          <button
            type="button"
            onClick={onDeleteCategory}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title={t('staticPages.faq.deleteCategoryTitle', 'Delete Category')}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {localItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            {t('staticPages.faq.noQuestions', 'No questions in this category yet.')}
          </p>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleItemDragEnd}>
            <SortableContext items={localItems.map((it) => it.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {localItems.map((item) => (
                  <FaqItemRow key={item.id} item={item} onEdit={onEditItem} onDelete={onDeleteItem} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-gray-200 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          {t('staticPages.faq.addItemButton', 'Add Question')}
        </button>
      </div>
    </div>
  );
};
