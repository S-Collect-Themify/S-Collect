import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
  Children,
  isValidElement,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PortalDropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void; search?: string }) => ReactNode;
  align?: 'left' | 'right';
  minWidth?: number;
  animate?: boolean;
  menuClassName?: string;
  offset?: number;
  searchPlaceholder?: string;
  showSearchThreshold?: number;
}

const getElementText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getElementText).join(' ');
  }
  if (isValidElement(node)) {
    const props = node.props as {
      children?: ReactNode;
      label?: string;
      title?: string;
      value?: string;
    };
    let text = '';
    if (props.label) text += ' ' + props.label;
    if (props.title) text += ' ' + props.title;
    if (props.value && typeof props.value === 'string') text += ' ' + props.value;
    if (props.children) {
      text += ' ' + getElementText(props.children);
    }
    return text;
  }
  return '';
};

const flattenChildren = (childrenNode: ReactNode): ReactNode[] => {
  const result: ReactNode[] = [];
  Children.forEach(childrenNode, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return;
    }
    if (isValidElement(child) && child.type === Fragment) {
      result.push(...flattenChildren((child.props as { children?: ReactNode }).children));
    } else {
      result.push(child);
    }
  });
  return result;
};

const isDivider = (node: ReactNode): boolean => {
  if (!isValidElement(node)) return false;
  const className = (node.props as { className?: string })?.className || '';
  return (
    className.includes('h-px') ||
    className.includes('border-t') ||
    className.includes('divider') ||
    node.type === 'hr'
  );
};

export default function PortalDropdown({
  trigger,
  children,
  align = 'left',
  minWidth = 160,
  animate = true,
  menuClassName = '',
  offset = 4,
  searchPlaceholder,
  showSearchThreshold = 10,
}: PortalDropdownProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth || minWidth;
    let left = align === 'left' ? rect.left : rect.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    setPosition({ top: rect.bottom + offset, left });
  }, [align, minWidth, offset]);

  useLayoutEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition]);

  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  const rawContent = children({ close, search: searchQuery });
  const flatContent = flattenChildren(rawContent);

  const nonDividerItems = flatContent.filter((c) => !isDivider(c));
  const totalItemCount = nonDividerItems.length;
  const hasSearch = searchQuery !== '' || totalItemCount > showSearchThreshold;

  let displayedChildren: ReactNode[] = flatContent;
  if (searchQuery.trim() !== '') {
    const q = searchQuery.trim().toLowerCase();
    displayedChildren = flatContent.filter((child) => {
      if (isDivider(child)) return false;
      const text = getElementText(child).toLowerCase();
      return text.includes(q);
    });
  }

  useEffect(() => {
    if (isOpen && hasSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasSearch]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    minWidth,
    zIndex: 9999,
  };

  const placeholderText =
    searchPlaceholder || t('search.placeholder', isAr ? 'بحث...' : 'Search...');

  const menuContent = (
    <div className="flex flex-col max-h-[360px]">
      {hasSearch && (
        <div
          className="sticky top-0 z-10 bg-white border-b border-gray-100 p-2 flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={placeholderText}
            className="w-full text-xs bg-transparent border-none outline-none focus:outline-none text-gray-700 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}
      <div className="overflow-y-auto flex-1">
        {searchQuery.trim() !== '' && displayedChildren.length === 0 ? (
          <div className="px-4 py-3 text-center text-xs text-gray-400">
            {isAr ? 'لا توجد نتائج' : 'No results found'}
          </div>
        ) : (
          displayedChildren
        )}
      </div>
    </div>
  );

  return (
    <>
      <div ref={triggerRef} className="relative inline-block">
        {trigger({ isOpen, toggle })}
      </div>
      {createPortal(
        animate ? (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={menuStyle}
                className={menuClassName}
              >
                {menuContent}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          isOpen && (
            <div ref={menuRef} style={menuStyle} className={menuClassName}>
              {menuContent}
            </div>
          )
        ),
        document.body
      )}
    </>
  );
}
