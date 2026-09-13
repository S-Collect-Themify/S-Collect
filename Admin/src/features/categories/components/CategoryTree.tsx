import React from 'react';
import { ChevronRight, SquarePen, Trash, Plus, Tag, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryTreeNode } from '../types';
import Toggle from '../../../components/ui/Toggle';

// ─── Level Badge ────────────────────────────────────────────────────────────────
const LEVEL_BADGE_STYLES: Record<0 | 1 | 2, string> = {
  0: 'bg-gray-900 text-white',
  1: 'bg-blue-50 text-blue-700',
  2: 'bg-gray-100 text-gray-600',
};

const LevelBadge = ({ depth }: { depth: 0 | 1 | 2 }) => {
  const { t } = useTranslation();
  const label =
    depth === 0
      ? t('categories.tree.department')
      : depth === 1
        ? t('categories.tree.category')
        : t('categories.tree.subCategory');

  return (
    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${LEVEL_BADGE_STYLES[depth]}`}>
      {label}
    </span>
  );
};

// ─── Tree Row ───────────────────────────────────────────────────────────────────
interface TreeRowProps {
  node: CategoryTreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onSelectOne: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onAddChild?: () => void;
  // Force-hide the expand chevron — used for orphan rows rendered flat,
  // outside the department tree, which have no expandable children slot.
  hideExpand?: boolean;
}

const TreeRow: React.FC<TreeRowProps> = ({
  node,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelectOne,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
  hideExpand,
}) => {
  const { t, i18n } = useTranslation();
  const isDepartment = node.depth === 0;
  const canHaveChildren = !hideExpand && node.depth < 2;
  const displayName = i18n.language === 'ar' ? (node.nameAr || node.name) : (node.nameEn || node.name);

  return (
    <div
      className={`flex items-center gap-3 px-4 border-b border-gray-100 transition-colors group ${
        isDepartment ? 'bg-gray-50/70 py-3' : 'py-2.5 hover:bg-gray-50/60'
      } ${isSelected ? 'bg-gray-50' : ''}`}
      style={{ paddingInlineStart: `${16 + node.depth * 28}px` }}
    >
      {/* Expand / Collapse */}
      <button
        type="button"
        onClick={onToggleExpand}
        disabled={!canHaveChildren}
        aria-label={isExpanded ? t('categories.tree.collapse') : t('categories.tree.expand')}
        className={`shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-md transition-transform ${
          canHaveChildren ? 'text-gray-500 hover:bg-gray-100 cursor-pointer' : 'invisible'
        }`}
      >
        <ChevronRight size={15} className={`transition-transform ${isExpanded ? 'rotate-90' : 'rtl:rotate-180'}`} />
      </button>

      {/* Bulk Checkbox (Category / Sub-Category only) */}
      {!isDepartment ? (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelectOne}
          aria-label={displayName}
          className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer shrink-0"
        />
      ) : (
        <span className="w-4 shrink-0" />
      )}

      {/* Image */}
      {node.image ? (
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
          <img src={node.image} alt={displayName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200/80 flex items-center justify-center text-gray-400 shrink-0">
          <ImageIcon size={16} />
        </div>
      )}

      {/* Name + Slug */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <p className={`truncate ${isDepartment ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
          {displayName || '—'}
        </p>
        <LevelBadge depth={node.depth} />
        {!isDepartment && (
          <span className="text-[11px] text-gray-400 font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
            {node.slug}
          </span>
        )}
      </div>

      {/* Products Count */}
      {!isDepartment && (
        <span className="text-xs text-gray-500 shrink-0 hidden sm:inline w-16 text-center">
          {node.productsCount} {t('categories.mobile.productsCount')}
        </span>
      )}

      {/* Active Toggle */}
      <Toggle checked={node.isActive} onChange={onToggleActive} />

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {canHaveChildren && onAddChild && (
          <button
            type="button"
            onClick={onAddChild}
            title={node.depth === 0 ? t('categories.tree.addCategory') : t('categories.tree.addSubCategory')}
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-green-50 hover:text-green-600 transition-all cursor-pointer text-gray-600"
          >
            <Plus size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          title={t('categories.modal.editCategory')}
          className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-blue-50 transition-all cursor-pointer text-gray-700"
        >
          <SquarePen size={15} />
        </button>
        {!isDepartment && (
          <button
            type="button"
            onClick={onDelete}
            title={t('categories.deleteModal.titleSingle')}
            className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <Trash size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Category Tree ─────────────────────────────────────────────────────────────
export interface CategoryTreeProps {
  tree: CategoryTreeNode[];
  // Categories that exist but aren't reachable from any Department (created
  // before this hierarchy, or otherwise detached) — shown in a separate
  // section so they stay editable instead of disappearing from the UI.
  orphans?: Category[];
  selectedIds: Set<string>;
  expandedIds: Set<string>;
  forceExpandAll?: boolean;
  onToggleExpand: (id: string) => void;
  onSelectOne: (id: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
  onAddCategory: (departmentId: string) => void;
  onAddSubCategory: (categoryId: string) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  tree,
  orphans = [],
  selectedIds,
  expandedIds,
  forceExpandAll,
  onToggleExpand,
  onSelectOne,
  onEdit,
  onDelete,
  onToggleActive,
  onAddCategory,
  onAddSubCategory,
}) => {
  const { t } = useTranslation();

  const renderNode = (node: CategoryTreeNode): React.ReactNode => {
    const isExpanded = forceExpandAll || expandedIds.has(node.id);
    const strip = (cat: CategoryTreeNode): Category => {
      const { children: _children, ...rest } = cat;
      return rest;
    };

    return (
      <React.Fragment key={node.id}>
        <TreeRow
          node={node}
          isExpanded={isExpanded}
          isSelected={selectedIds.has(node.id)}
          onToggleExpand={() => onToggleExpand(node.id)}
          onSelectOne={() => onSelectOne(node.id)}
          onEdit={() => onEdit(strip(node))}
          onDelete={() => onDelete(strip(node))}
          onToggleActive={() => onToggleActive(strip(node))}
          onAddChild={
            node.depth === 0
              ? () => onAddCategory(node.id)
              : node.depth === 1
                ? () => onAddSubCategory(node.id)
                : undefined
          }
        />

        {isExpanded && (
          <>
            {node.children.map(renderNode)}
            {node.children.length === 0 && (
              <div
                className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 text-xs text-gray-400"
                style={{ paddingInlineStart: `${16 + (node.depth + 1) * 28}px` }}
              >
                <Tag size={13} className="text-gray-300" />
                {node.depth === 0 ? t('categories.tree.emptyDepartment') : t('categories.tree.emptyCategory')}
              </div>
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  if (tree.length === 0 && orphans.length === 0) {
    return (
      <div className="py-16 text-center">
        <Tag size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">{t('categories.emptyState')}</p>
      </div>
    );
  }

  return (
    <div>
      {tree.map(renderNode)}

      {orphans.length > 0 && (
        <>
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50/70 border-b border-t border-amber-100">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">{t('categories.tree.unassignedNotice')}</p>
          </div>
          {orphans.map((orphan) => (
            <TreeRow
              key={orphan.id}
              node={{ ...orphan, children: [] }}
              isExpanded={false}
              isSelected={selectedIds.has(orphan.id)}
              hideExpand
              onToggleExpand={() => {}}
              onSelectOne={() => onSelectOne(orphan.id)}
              onEdit={() => onEdit(orphan)}
              onDelete={() => onDelete(orphan)}
              onToggleActive={() => onToggleActive(orphan)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CategoryTree;
