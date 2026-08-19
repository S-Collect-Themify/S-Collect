import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ChevronDown, Search, Check, X } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { useAdminBuyers } from '../../buyers/hooks/useBuyers';

interface OrderBuyerDropdownProps {
  selectedBuyerId?: string;
  onSelectBuyer: (buyerId: string | undefined) => void;
  className?: string;
}

export function OrderBuyerDropdown({
  selectedBuyerId,
  onSelectBuyer,
  className = '',
}: OrderBuyerDropdownProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch list of buyers from endpoint /admin/buyers
  const { data: buyersData, isLoading } = useAdminBuyers({ pageSize: 100 });
  const buyers = buyersData?.items ?? [];

  const selectedBuyer = useMemo(() => {
    if (!selectedBuyerId) return null;
    return buyers.find((b) => b.id === selectedBuyerId);
  }, [buyers, selectedBuyerId]);

  const filteredBuyers = useMemo(() => {
    if (!searchQuery.trim()) return buyers;
    const q = searchQuery.toLowerCase().trim();
    return buyers.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.phoneNumber && b.phoneNumber.toLowerCase().includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q))
    );
  }, [buyers, searchQuery]);

  const label = selectedBuyer
    ? selectedBuyer.name !== '---'
      ? selectedBuyer.name
      : selectedBuyer.email
    : t('ordersPage.allBuyers', 'All Buyers');

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
          className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-gray-200 text-body-sm text-gray-700 focus:outline-none hover:border-gray-300 transition-all bg-white cursor-pointer whitespace-nowrap w-full md:w-auto ${className}`}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <User size={15} className="text-gray-500 shrink-0" />
            <span className="truncate">
              {t('ordersPage.buyer', 'Buyer')}: {isLoading ? t('common.loading', 'Loading...') : label}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${
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
              <Search size={14} className={`absolute text-gray-400 pointer-events-none ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('ordersPage.searchBuyerPlaceholder', 'Search buyer by name, email or ID...')}
                className={`w-full h-8 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors ${
                  isRtl ? 'pr-8 pl-7' : 'pl-8 pr-7'
                }`}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className={`absolute text-gray-400 hover:text-gray-600 ${isRtl ? 'left-2' : 'right-2'}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Buyers List */}
          <div className="overflow-y-auto max-h-60 p-1 divide-y divide-gray-50">
            {/* All Buyers Option */}
            <button
              type="button"
              onClick={() => {
                onSelectBuyer(undefined);
                close();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-start text-xs rounded-lg transition-colors cursor-pointer ${
                !selectedBuyerId
                  ? 'bg-gray-100 text-gray-900 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold">{t('ordersPage.allBuyers', 'All Buyers')}</span>
              {!selectedBuyerId && <Check size={14} className="text-gray-900 shrink-0" />}
            </button>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {t('common.loading', 'Loading buyers...')}
              </div>
            ) : filteredBuyers.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {t('ordersPage.noBuyersFound', 'No buyers found')}
              </div>
            ) : (
              filteredBuyers.map((buyer) => {
                const isSelected = buyer.id === selectedBuyerId;
                const name = buyer.name !== '---' ? buyer.name : buyer.email;
                const subText = buyer.email !== '---' ? buyer.email : buyer.id;

                return (
                  <button
                    key={buyer.id}
                    type="button"
                    onClick={() => {
                      onSelectBuyer(buyer.id);
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

export default OrderBuyerDropdown;
