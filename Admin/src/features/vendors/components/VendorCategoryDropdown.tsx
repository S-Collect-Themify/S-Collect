import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { useVendorCategories } from '../hooks/useVendors';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

interface VendorCategoryDropdownProps {
  selected: string;
  onChange: (cat: string) => void;
  categories?: string[];
}

export default function VendorCategoryDropdown({
  selected,
  onChange,
  categories: customCategories,
}: VendorCategoryDropdownProps) {
  const { t } = useTranslation();
  const { data: apiCategories = [] } = useVendorCategories();
  const [searchTerm, setSearchTerm] = useState('');

  const categoriesList = customCategories && customCategories.length > 0 ? customCategories : apiCategories;
  const label = selected || t('vendors.table.category');

  const filteredCategories = categoriesList.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <PortalDropdown
      minWidth={200}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <button
          className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap"
          onClick={() => {
            setSearchTerm('');
            toggle();
          }}
        >
          <span className="truncate max-w-35">{label}</span>
          <ChevronDown
            color="black"
            size={15}
            className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col min-w-45">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('vendors.table.searchCategory', 'Search category...')}
                className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div className="max-h-56 overflow-y-auto">
            <div
              className={DD_ITEM}
              onClick={() => {
                onChange('');
                setSearchTerm('');
                close();
              }}
            >
              <input
                type="radio"
                readOnly
                checked={selected === ''}
                aria-label={t('vendors.table.allCategories')}
                className="accent-black w-3.5 h-3.5 cursor-pointer shrink-0"
              />
              <span className="truncate">{t('vendors.table.allCategories')}</span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-gray-400 text-center">
                {t('vendors.table.noCategoriesFound', 'No categories found')}
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div
                  key={cat}
                  className={DD_ITEM}
                  onClick={() => {
                    onChange(cat);
                    setSearchTerm('');
                    close();
                  }}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={selected === cat}
                    aria-label={cat}
                    className="accent-black w-3.5 h-3.5 cursor-pointer shrink-0"
                  />
                  <span className="truncate">{cat}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </PortalDropdown>
  );
}
