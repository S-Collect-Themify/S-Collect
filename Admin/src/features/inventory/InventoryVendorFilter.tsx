import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, ChevronDown, Search, Check } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';
import type { InventoryVendorOption } from './types';

interface InventoryVendorFilterProps {
  vendors: InventoryVendorOption[];
  selectedVendorId: string;
  onSelectVendor: (id: string) => void;
  isLoading?: boolean;
}

export const InventoryVendorFilter = ({
  vendors,
  selectedVendorId,
  onSelectVendor,
  isLoading = false,
}: InventoryVendorFilterProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const allVendorsLabel = t('inventoryPage.allVendors', 'All Vendors');

  const selectedVendor = useMemo(
    () => vendors.find((v) => v.id === selectedVendorId),
    [vendors, selectedVendorId]
  );

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase().trim();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)
    );
  }, [vendors, searchQuery]);

  const label = selectedVendor?.name || allVendorsLabel;

  return (
    <PortalDropdown
      minWidth={240}
      align={isRtl ? 'right' : 'left'}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-80"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          className="flex items-center justify-between gap-2.5 h-10 px-3.5 border border-gray-300 rounded-lg text-label-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-50 transition-colors cursor-pointer shrink-0 min-w-44 max-w-64 truncate disabled:opacity-50"
        >
          <span className="flex items-center gap-2 truncate min-w-0">
            <Store size={15} className="text-gray-500 shrink-0" />
            <span className="truncate">
              {isLoading
                ? t('inventoryPage.loadingVendors', 'Loading...')
                : label}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col h-full min-w-60 max-w-80">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-2.5 rtl:right-2.5 rtl:left-auto text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'inventoryPage.searchVendorPlaceholder',
                  'Search vendor...'
                )}
                className="w-full h-8 pl-8 pr-7 rtl:pr-8 rtl:pl-7 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="absolute right-2 rtl:left-2 rtl:right-auto text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-60 p-1">
            {/* All Vendors (clears the filter) */}
            <button
              type="button"
              onClick={() => {
                onSelectVendor('');
                close();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-start text-xs rounded-lg transition-colors cursor-pointer ${
                !selectedVendorId
                  ? 'bg-gray-100 text-gray-900 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{allVendorsLabel}</span>
              {!selectedVendorId && (
                <Check size={14} className="text-gray-600 shrink-0" />
              )}
            </button>

            <div className="my-1 border-t border-gray-50" />

            {filteredVendors.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {t('inventoryPage.noVendorsFound', 'No vendors found')}
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const isSelected = vendor.id === selectedVendorId;
                return (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => {
                      onSelectVendor(vendor.id);
                      close();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-start text-xs rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-gray-100 text-gray-900 font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-2 rtl:pr-0 rtl:pl-2">
                      {vendor.name}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-gray-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </PortalDropdown>
  );
};

export default InventoryVendorFilter;
