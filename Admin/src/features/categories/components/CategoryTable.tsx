import React from 'react';
import { SquarePen, Trash, Tag, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';
import Toggle from '../../../components/ui/Toggle';

interface CategoryRowProps {
  category: Category;
  selectedIds: Set<string>;
  onSelectOne: (id: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category: cat,
  selectedIds,
  onSelectOne,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { i18n } = useTranslation();

  return (
    <tr
      className={`border-b border-gray-100 transition-colors group ${
        selectedIds.has(cat.id) ? 'bg-gray-50' : 'hover:bg-gray-50/60'
      }`}
    >
      {/* Checkbox */}
      <td className="py-3.5 px-4 w-10">
        <input
          type="checkbox"
          checked={selectedIds.has(cat.id)}
          onChange={() => onSelectOne(cat.id)}
          aria-label={i18n.language === 'ar' ? cat.nameAr : cat.nameEn || cat.name}
          className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
        />
      </td>

      {/* Image Thumbnail */}
      <td className="py-3.5 px-4 w-16">
        {cat.image ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img
              src={cat.image}
              alt={cat.nameEn || 'Category'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-400 shrink-0">
            <ImageIcon size={20} />
          </div>
        )}
      </td>

      {/* Category Name */}
      <td className="py-3.5 px-4">
        <p className="font-semibold text-gray-900">
          {i18n.language === 'ar'
            ? (cat.nameAr || cat.name || cat.nameEn || '—')
            : (cat.nameEn || cat.name || cat.nameAr || '—')}
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
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2.5 hover:bg-blue-50 transition-all cursor-pointer text-gray-700"
            title="Edit"
          >
            <SquarePen size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2.5 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
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

const CategoryTable: React.FC<DesktopTableProps> = ({
  categories,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { t } = useTranslation();
  const allSelected = categories.length > 0 && categories.every((c) => selectedIds.has(c.id));
  const someSelected = categories.some((c) => selectedIds.has(c.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            {/* Select All checkbox */}
            <th className="py-3.5 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={onSelectAll}
                aria-label={t('categories.selectAll', 'Select all categories')}
                className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
            </th>
            {[
              t('categories.columns.image'),
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
        <tbody className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              selectedIds={selectedIds}
              onSelectOne={onSelectOne}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
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
