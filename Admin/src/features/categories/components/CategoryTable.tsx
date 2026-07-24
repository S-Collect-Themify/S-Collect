import { SquarePen, Trash, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Category } from '../types';
import Toggle from './Toggle';

// ─── Sortable Row (internal – used only by DesktopTable) ─────────────────────
interface SortableRowProps {
  category: Category;
  selectedIds: Set<string>;
  onSelectOne: (id: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}

const SortableRow = ({
  category: cat,
  selectedIds,
  onSelectOne,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableRowProps) => {
  const { i18n } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? ('relative' as const) : undefined,
    zIndex: isDragging ? 99 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 transition-colors group ${
        selectedIds.has(cat.id) ? 'bg-gray-50' : 'hover:bg-gray-50/60'
      } ${isDragging ? 'bg-white shadow-xl' : ''}`}
    >
      {/* Drag Handle */}
      <td className="py-3.5 pl-4 pr-1 w-8">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </td>

      {/* Checkbox */}
      <td className="py-3.5 px-4 w-10">
        <input
          type="checkbox"
          checked={selectedIds.has(cat.id)}
          onChange={() => onSelectOne(cat.id)}
          className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
        />
      </td>

      {/* Category Name */}
      <td className="py-3.5 px-4">
        <p className="font-semibold text-gray-900">
          {i18n.language === 'ar' ? cat.nameAr : cat.nameEn}
        </p>
      </td>

      {/* Slug */}
      <td className="py-3.5 px-4">
        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
          {cat.slug}
        </span>
      </td>

      {/* Products Count */}
      <td className="py-3.5 px-4">
        <span className="font-medium text-gray-900">{cat.productsCount}</span>
      </td>

      {/* Active Toggle */}
      <td className="py-3.5 px-4">
        <Toggle checked={cat.isActive} onChange={() => onToggleActive(cat)} />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(cat)}
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2.5 hover:bg-blue-50 transition-all cursor-pointer"
            title="Edit"
          >
            <SquarePen size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2.5 text-red hover:bg-red-light transition-all cursor-pointer"
            title="Delete"
          >
            <Trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Desktop Table ─────────────────────────────────────────────────────────────
export interface DesktopTableProps {
  categories: Category[];
  selectedIds: Set<string>;
  onSelectOne: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}

const CategoryTable = ({
  categories,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleActive,
}: DesktopTableProps) => {
  const { t } = useTranslation();
  const allSelected = categories.length > 0 && categories.every((c) => selectedIds.has(c.id));
  const someSelected = categories.some((c) => selectedIds.has(c.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            {/* Empty for drag handle */}
            <th className="py-3.5 pl-4 pr-1 w-8"></th>
            {/* Select All checkbox */}
            <th className="py-3.5 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
            </th>
            {[
              t('categories.columns.category'),
              t('categories.columns.slug'),
              t('categories.columns.productsCount'),
              t('categories.columns.status'),
              t('categories.columns.actions'),
            ].map((h) => (
              <th
                key={h}
                className="text-left rtl:text-right py-3.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {categories.map((cat) => (
              <SortableRow
                key={cat.id}
                category={cat}
                selectedIds={selectedIds}
                onSelectOne={onSelectOne}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </SortableContext>
        </tbody>
      </table>

      {categories.length === 0 && (
        <div className="py-16 text-center">
          <Tag size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">{t('categories.emptyState')}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;
