import { SquarePen, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';
import Toggle from '../../../components/ui/Toggle';

// ─── Mobile Card ───────────────────────────────────────────────────────────────
export interface MobileCardProps {
  category: Category;
  selected: boolean;
  onSelect: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}

const MobileCard = ({
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
}: MobileCardProps) => {
  const { t, i18n } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
        selected ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50/50' : 'border-gray-200/80 hover:border-gray-300'
      }`}
    >
      {/* Top section: Checkbox + Image + Name & Slug */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer mt-1 shrink-0"
        />

        {/* Thumbnail */}
        {category.image ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img
              src={category.image}
              alt={category.nameEn || 'Category'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-400 shrink-0">
            <ImageIcon size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-snug">
            {i18n.language === 'ar' ? category.nameAr : category.nameEn}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-normal">
            {t('categories.mobile.slug')}: {category.slug}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3.5 border-t border-gray-100" />

      {/* Bottom section: Products Count & Actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-400 mb-0.5">
            {t('categories.columns.productsCount')}
          </p>
          <p className="text-base font-bold text-gray-900">
            {category.productsCount}
          </p>
        </div>

        {/* Actions: Activate Toggle, Edit, Delete */}
        <div className="flex items-center gap-2 shrink-0">
          <Toggle
            checked={category.isActive}
            onChange={() => onToggleActive(category)}
          />

          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
            title={t('categories.modal.editCategory')}
          >
            <SquarePen size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-light text-red hover:bg-red-light/80 active:scale-95 transition-all cursor-pointer"
            title={t('categories.deleteModal.titleSingle')}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileCard;
