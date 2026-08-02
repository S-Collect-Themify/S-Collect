import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, ChevronDown, Search, Check } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import type { Vendor } from '../../vendors/types/vendors';

interface VendorReportVendorDropdownProps {
  vendors: Vendor[];
  selectedVendorId: string;
  onSelectVendor: (id: string) => void;
  isLoading?: boolean;
}

export default function VendorReportVendorDropdown({
  vendors,
  selectedVendorId,
  onSelectVendor,
  isLoading = false,
}: VendorReportVendorDropdownProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId);
  }, [vendors, selectedVendorId]);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase().trim();
    return vendors.filter(
      (v) =>
        (v.businessName && v.businessName.toLowerCase().includes(q)) ||
        (v.owner && v.owner.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.id && v.id.toLowerCase().includes(q))
    );
  }, [vendors, searchQuery]);

  const label = selectedVendor?.businessName || selectedVendor?.owner || t('vendorReports.selectVendor', 'Select Vendor');

  return (
    <PortalDropdown
      minWidth={260}
      align={isRtl ? 'right' : 'left'}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-80"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          className="flex items-center justify-between gap-2.5 h-10 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer shrink-0 min-w-48 max-w-72 truncate"
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <Store size={15} className="text-gray-500 shrink-0" />
            <span className="truncate">{isLoading ? t('common.loading', 'Loading...') : label}</span>
          </div>
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
        <div className="flex flex-col h-full min-w-64 max-w-80">
          {/* Search Header */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('vendorReports.searchVendorPlaceholder', 'Search vendor by name or ID...')}
                className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Vendors List */}
          <div className="overflow-y-auto max-h-60 p-1 divide-y divide-gray-50">
            {filteredVendors.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {t('vendorReports.noVendorsFound', 'No vendors found')}
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const isSelected = vendor.id === selectedVendorId;
                const name = vendor.businessName || vendor.owner || '--';
                const subText = vendor.owner ? `${vendor.owner} • ${vendor.id.slice(-6)}` : vendor.id;

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
                        ? 'bg-green-50 text-green-800 font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col truncate min-w-0 pr-2">
                      <span className="truncate font-semibold">{name}</span>
                      <span className="text-[11px] text-gray-400 truncate">{subText}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-green-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </PortalDropdown>
  );
}
