import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ModernSelectOption {
  label: string;
  value: string;
  badge?: string | number;
}

export interface ModernSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: ModernSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  isSearchable?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  combobox?: boolean;
  creatable?: boolean;
  minWidth?: number;
  maxHeight?: number;
}

export const ModernSelect = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  isSearchable = true,
  disabled = false,
  className = '',
  size = 'sm',
  combobox = false,
  creatable = false,
  minWidth,
  maxHeight = 240,
}: ModernSelectProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 0, maxHeight: 240 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Search input is enabled by default unless explicitly disabled
  const shouldShowSearch = isSearchable !== false;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const targetWidth = Math.max(rect.width, minWidth || 140);

    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    // Prefer opening below. Open upward if space below is under 140px and space above is larger.
    const openUpward = spaceBelow < 140 && spaceAbove > spaceBelow;
    const availableHeight = openUpward ? spaceAbove : spaceBelow;
    const resolvedMaxHeight = Math.max(120, Math.min(maxHeight || 240, availableHeight));

    let left = rect.left;
    if (left + targetWidth > window.innerWidth - 8) {
      left = window.innerWidth - targetWidth - 8;
    }
    if (left < 8) left = 8;

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
        width: targetWidth,
        maxHeight: resolvedMaxHeight,
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left,
        width: targetWidth,
        maxHeight: resolvedMaxHeight,
      });
    }
  }, [minWidth, maxHeight]);

  useLayoutEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  // Click outside and scroll listeners
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleScrollOrResize = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && shouldShowSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldShowSearch]);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    );
  });

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0].value);
      } else if ((creatable || combobox) && searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      }
    }
  };

  // Height & padding styles
  const isCompact = size === 'sm';
  const triggerHeight = isCompact ? 'h-8 text-xs' : 'h-10 text-sm';

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: coords.top !== undefined ? coords.top : undefined,
    bottom: coords.bottom !== undefined ? coords.bottom : undefined,
    left: coords.left,
    width: coords.width,
    maxHeight: coords.maxHeight,
    zIndex: 99999,
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {combobox ? (
        /* Combobox Trigger: Free-text input + dropdown toggle */
        <div
          className={`relative flex items-center w-full rounded-lg border bg-white transition-all ${triggerHeight} ${
            isOpen
              ? 'border-gray-950 ring-2 ring-gray-950/10'
              : 'border-gray-200 hover:border-gray-300'
          } ${className}`}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || (isArabic ? 'اختر أو اكتب...' : 'Select or type...')}
            className="w-full bg-transparent px-2.5 py-1 text-gray-800 font-medium placeholder-gray-400 focus:outline-none pr-7 rtl:pr-2.5 rtl:pl-7"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition cursor-pointer rtl:right-auto rtl:left-1.5"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-gray-700' : ''}`}
            />
          </button>
        </div>
      ) : (
        /* Standard Select Trigger Button */
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-2.5 transition-all text-start cursor-pointer ${triggerHeight} ${
            isOpen
              ? 'border-gray-950 ring-2 ring-gray-950/10'
              : 'border-gray-200 hover:border-gray-300'
          } ${className}`}
        >
          <span
            className={`truncate font-medium ${
              selectedOption || value ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {selectedOption
              ? selectedOption.label
              : value || placeholder || (isArabic ? 'اختر...' : 'Select...')}
          </span>

          <ChevronDown
            size={14}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-gray-700' : ''
            }`}
          />
        </button>
      )}

      {/* Floating Popover via Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: coords.bottom !== undefined ? 4 : -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: coords.bottom !== undefined ? 4 : -4, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                style={menuStyle}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200/90 bg-white/95 backdrop-blur-md shadow-xl text-xs"
              >
                {/* Search Bar inside popover */}
                {shouldShowSearch && (
                  <div
                    className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur-xs p-2 flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search size={13} className="text-gray-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          setIsOpen(false);
                        } else if (e.key === 'Enter') {
                          if (filteredOptions.length > 0) {
                            handleSelect(filteredOptions[0].value);
                          } else if ((creatable || combobox) && searchQuery.trim()) {
                            handleSelect(searchQuery.trim());
                          }
                        }
                      }}
                      placeholder={searchPlaceholder || (isArabic ? 'بحث...' : 'Search...')}
                      className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer shrink-0"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Options List with max-height and custom scrollbar */}
                <div className="overflow-y-auto flex-1 p-1 scrollbar-thin">
                  {filteredOptions.length === 0 && !(creatable || combobox) ? (
                    <div className="px-3 py-4 text-center text-xs text-gray-400">
                      {isArabic ? 'لا توجد خيارات مطابقة' : 'No options found'}
                    </div>
                  ) : (
                    <>
                      {filteredOptions.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-start transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-gray-900 text-white font-semibold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="truncate">{opt.label}</span>

                            <div className="flex items-center gap-1 shrink-0">
                              {opt.badge !== undefined && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                    isSelected
                                      ? 'bg-gray-800 text-gray-200'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                              {isSelected && <Check size={13} className="shrink-0 text-white" />}
                            </div>
                          </button>
                        );
                      })}

                      {/* Custom creatable value action */}
                      {(creatable || combobox) &&
                        searchQuery.trim() &&
                        !options.some(
                          (o) =>
                            o.value.toLowerCase() === searchQuery.trim().toLowerCase() ||
                            o.label.toLowerCase() === searchQuery.trim().toLowerCase()
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleSelect(searchQuery.trim())}
                            className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-start text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-t border-gray-100 mt-1"
                          >
                            <Plus size={13} className="shrink-0" />
                            <span className="truncate">
                              {isArabic
                                ? `استخدام "${searchQuery.trim()}"`
                                : `Use "${searchQuery.trim()}"`}
                            </span>
                          </button>
                        )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
