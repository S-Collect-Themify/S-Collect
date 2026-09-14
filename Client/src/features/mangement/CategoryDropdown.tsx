import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';
import { getCategoriesTree } from '../../services/products';
import { buildCategoryTree, findNode, type CategoryTreeNode } from '../../utils/categoryTree';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

interface CategoryDropdownProps {
  selected: string[];
  onChange: (cats: string[]) => void;
}

function CategoryDropdown({ selected, onChange }: CategoryDropdownProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['category-tree'],
    queryFn: async () => buildCategoryTree(await getCategoriesTree()),
    staleTime: 5 * 60 * 1000,
  });

  const label = (node: CategoryTreeNode) => (isAr ? node.nameAr || node.name : node.name);
  const allSelected = selected.length === 0;

  let dropdownLabel = t('managementTable.category');
  if (selected.length === 1) {
    const node = findNode(tree, selected[0]);
    if (node) dropdownLabel = label(node);
  } else if (selected.length > 1) {
    dropdownLabel = t('managementTable.categoriesCount', { count: selected.length });
  }

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]);

  const renderNode = (node: CategoryTreeNode) => (
    <div key={node.id}>
      <div
        className={DD_ITEM}
        style={{ paddingInlineStart: `${14 + node.depth * 16}px` }}
        onClick={() => toggle(node.id)}
      >
        <input
          type="checkbox"
          readOnly
          checked={selected.includes(node.id)}
          className="accent-black w-3.5 h-3.5 cursor-pointer shrink-0"
        />
        <span className={node.depth === 0 ? 'font-semibold' : ''}>{label(node)}</span>
      </div>
      {node.children.map(renderNode)}
    </div>
  );

  return (
    <PortalDropdown
      minWidth={220}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
      trigger={({ isOpen, toggle: toggleOpen }) => (
        <button
          className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap"
          onClick={toggleOpen}
          disabled={isLoading}
        >
          {dropdownLabel}
          <ChevronDown
            color="black"
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <div className="max-h-80 overflow-y-auto">
          <div
            className={DD_ITEM}
            onClick={() => {
              onChange([]);
              close();
            }}
          >
            <input
              type="checkbox"
              readOnly
              checked={allSelected}
              className="accent-black w-3.5 h-3.5 cursor-pointer"
            />
            <span>{t('managementTable.allCategories')}</span>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          {tree.map(renderNode)}
        </div>
      )}
    </PortalDropdown>
  );
}

export default CategoryDropdown;
