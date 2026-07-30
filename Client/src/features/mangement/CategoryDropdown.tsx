import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/useCategories';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';
import type { Category } from '../../services/products';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

interface CategoryDropdownProps {
  selected: string[];
  onChange: (cats: string[]) => void;
}

function CategoryDropdown({ selected, onChange }: CategoryDropdownProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { categories, isLoading } = useCategories();

  const allSelected = selected.length === 0;

  let label = t('managementTable.category');
  if (selected.length === 1) {
    const selectedCat = (categories as Category[]).find(
      (c: Category) => c.id === selected[0]
    );
    if (selectedCat) {
      label = isAr ? selectedCat.nameAr : selectedCat.name;
    }
  } else if (selected.length > 1) {
    label = t('managementTable.categoriesCount', { count: selected.length });
  }

  const toggle = (catId: string) =>
    onChange(
      selected.includes(catId)
        ? selected.filter((c: string) => c !== catId)
        : [...selected, catId]
    );

  return (
    <PortalDropdown
      minWidth={200}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
      trigger={({ isOpen, toggle: toggleOpen }) => (
        <button
          className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap"
          onClick={toggleOpen}
          disabled={isLoading}
        >
          {label}
          <ChevronDown
            color="black"
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <>
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
          {(categories as Category[]).map((cat: Category) => {
            const catName = isAr ? cat.nameAr : cat.name;
            return (
              <div
                key={cat.id}
                className={DD_ITEM}
                onClick={() => toggle(cat.id)}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected.includes(cat.id)}
                  className="accent-black w-3.5 h-3.5 cursor-pointer"
                />
                <span>{catName}</span>
              </div>
            );
          })}
        </>
      )}
    </PortalDropdown>
  );
}

export default CategoryDropdown;
