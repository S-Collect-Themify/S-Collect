import { useTranslation } from 'react-i18next';
import { CATEGORIES } from './constant';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

interface CategoryDropdownProps {
  selected: string[];
  onChange: (cats: string[]) => void;
}

function CategoryDropdown({ selected, onChange }: CategoryDropdownProps) {
  const { t } = useTranslation();

  const allSelected = selected.length === 0;
  const label = allSelected
    ? t('managementTable.category')
    : selected.length === 1
      ? t(`managementTable.categories.${selected[0]}`)
      : t('managementTable.categoriesCount', { count: selected.length });

  const toggle = (cat: string) =>
    onChange(
      selected.includes(cat)
        ? selected.filter((c) => c !== cat)
        : [...selected, cat]
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
          {CATEGORIES.map((cat) => (
            <div key={cat} className={DD_ITEM} onClick={() => toggle(cat)}>
              <input
                type="checkbox"
                readOnly
                checked={selected.includes(cat)}
                className="accent-black w-3.5 h-3.5 cursor-pointer"
              />
              <span>{t(`managementTable.categories.${cat}`, { defaultValue: cat })}</span>
            </div>
          ))}
        </>
      )}
    </PortalDropdown>
  );
}

export default CategoryDropdown;
