import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Search, X, Loader2, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchVendorProducts } from '../../services/products';
import { useManagementStore } from '../../features/mangement/managementStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const InputSearch = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const setSearchInManagement = useManagementStore((state) => state.setSearch);
  const { isMobile } = useBreakpoint();

  const [openMobile, setOpenMobile] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 800);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle body scroll for mobile modal
  useEffect(() => {
    if (openMobile && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [openMobile, isMobile]);

  // Click outside listener for desktop dropdown using reusable hook
  useOutsideClick(
    containerRef,
    useCallback(() => {
      setFocused(false);
    }, [])
  );

  // Fetch search results from API
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['header-search-products', debouncedQuery],
    queryFn: () =>
      searchVendorProducts({ search: debouncedQuery, pageNum: 1, pageSize: 6 }),
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 60 * 1000,
  });

  const products = useMemo(() => {
    if (!rawData) return [];
    const items = rawData.items || (Array.isArray(rawData) ? rawData : []);
    return items.map((p: any) => {
      const catObj = p.category || {};
      const categoryName = isArabic
        ? catObj.nameAr || catObj.name || ''
        : catObj.name || catObj.nameAr || '';

      let parsedPrice = 0;
      if (typeof p.minPrice === 'number') {
        parsedPrice = p.minPrice;
      } else if (p.minPrice && typeof p.minPrice === 'object') {
        parsedPrice = Number(
          (p.minPrice as any).amount || (p.minPrice as any).value || 0
        );
      } else if (typeof p.compareAtPrice === 'number') {
        parsedPrice = p.compareAtPrice;
      } else if (typeof p.price === 'number') {
        parsedPrice = p.price;
      }

      let iconUrl = '';
      if (typeof p.thumbnailUrl === 'string') {
        iconUrl = p.thumbnailUrl;
      } else if (p.thumbnailUrl && typeof p.thumbnailUrl === 'object') {
        iconUrl =
          (p.thumbnailUrl as any).url || (p.thumbnailUrl as any).src || '';
      } else if (Array.isArray(p.images) && p.images.length > 0) {
        const thumb =
          p.images.find((img: any) => img.isThumbnail) || p.images[0];
        iconUrl = typeof thumb === 'string' ? thumb : thumb?.url || thumb?.src || '';
      }

      return {
        id: p.id,
        name: isArabic ? p.nameAr || p.name : p.name || p.nameAr,
        category: categoryName,
        price: parsedPrice,
        image: iconUrl,
      };
    });
  }, [rawData, isArabic]);

  const handleSelectProduct = (productId: string) => {
    setFocused(false);
    setOpenMobile(false);
    setQuery('');
    navigate(`/product-details/${productId}`);
  };

  const handleViewAllInManagement = () => {
    if (!query.trim()) return;
    setSearchInManagement(query.trim());
    setFocused(false);
    setOpenMobile(false);
    navigate('/management');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleViewAllInManagement();
    } else if (e.key === 'Escape') {
      setFocused(false);
      setOpenMobile(false);
    }
  };

  const showDropdown = focused && query.trim().length >= 3;

  const renderProductItem = (p: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
  }) => (
    <button
      key={p.id}
      type="button"
      onClick={() => handleSelectProduct(p.id)}
      className="w-full text-start flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Package className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-amber-600 transition-colors">
          {p.name}
        </p>
        {p.category && (
          <p className="text-xs text-gray-400 truncate">{p.category}</p>
        )}
      </div>
      {p.price > 0 && (
        <span className="text-xs font-semibold text-gray-700 shrink-0">
          {p.price.toLocaleString()}{' '}
          <span className="text-[10px] text-gray-400 font-normal">
            {t('dashboardMetrics.unit.sar') || 'SAR'}
          </span>
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Desktop Search Container */}
      <div ref={containerRef} className="hidden md:block relative w-64 lg:w-80 xl:w-96">
        <div className="relative flex items-center">
          <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none`} />

          <input
            type="text"
            value={query}
            onFocus={() => setFocused(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocused(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('search.products')}
            aria-label={t('search.products')}
            className={`w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 ${
              isArabic ? 'pr-9 pl-9' : 'pl-9 pr-9'
            } py-2 rounded-xl text-sm outline-none border border-white/10 focus:border-gray-300 transition-all placeholder:text-gray-300 focus:placeholder:text-gray-400`}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
              }}
              className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:text-gray-700 cursor-pointer`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Desktop Live Results Dropdown */}
        {showDropdown && (
          <div
            className={`absolute top-full mt-2 ${
              isArabic ? 'right-0' : 'left-0'
            } w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('search.searchResults')}
              </span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
            </div>

            <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
              {isLoading ? (
                <div className="py-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span>{t('search.loading')}</span>
                </div>
              ) : products.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    {t('search.noResults')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">"{query}"</p>
                </div>
              ) : (
                products.map(renderProductItem)
              )}
            </div>

            {query.trim().length >= 3 && (
              <button
                type="button"
                onClick={handleViewAllInManagement}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 border-t border-gray-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{t('search.viewAll')}</span>
                {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Icon Button */}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-white/10 text-white cursor-pointer"
        aria-label="Open search"
      >
        <Search className="w-5 h-5 text-gray-100" />
      </button>

      {/* Mobile Top Search Drawer Modal */}
      {openMobile && (
        <div className="fixed inset-0 z-50" onClick={() => setOpenMobile(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal Sheet - Positioned with top breathing room */}
          <div
            className="absolute top-18 left-4 right-4 max-h-[90vh] bg-white rounded-lg p-4 shadow-2xl flex flex-col z-50 border border-gray-100 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? 'rtl' : 'ltr'}
          >

            {/* Input Header */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2.5 rounded-xl shrink-0">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                className="text-xs font-semibold text-amber-600 px-1 cursor-pointer"
              >
                {t('search.cancel')}
              </button>
            </div>

            {/* Search Results / Suggestions */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-1">
              {query.trim().length < 3 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  {t('search.trySearching')}
                </div>
              ) : isLoading ? (
                <div className="py-10 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span>{t('search.loading')}</span>
                </div>
              ) : products.length === 0 ? (
                <div className="py-10 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    {t('search.noResults')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400">
                    {t('search.searchResults')}
                  </div>
                  {products.map(renderProductItem)}
                </>
              )}
            </div>

            {query.trim().length >= 3 && (
              <button
                type="button"
                onClick={handleViewAllInManagement}
                className="w-full mt-3 p-3 bg-gray-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>{t('search.viewAll')}</span>
                {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InputSearch;
