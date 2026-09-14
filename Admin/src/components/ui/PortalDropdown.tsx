import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalDropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  animate?: boolean;
  menuClassName?: string;
  offset?: number;
}

export default function PortalDropdown({
  trigger,
  children,
  align = 'left',
  minWidth = 160,
  animate = true,
  menuClassName = '',
  offset = 4,
}: PortalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const availableWidth = window.innerWidth - 24;
    const rawMenuWidth = menuRef.current?.offsetWidth || minWidth;
    const menuWidth = Math.min(rawMenuWidth, availableWidth);

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - menuWidth;
    } else if (align === 'center') {
      left = rect.left + rect.width / 2 - menuWidth / 2;
    }
    left = Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12));
    setPosition({ top: rect.bottom + offset, left });
  }, [align, minWidth, offset]);

  useLayoutEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
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
      if (menuRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
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

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    minWidth,
    zIndex: 9999,
  };

  return (
    <>
      <div ref={triggerRef} className="relative ">
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
                {children({ close })}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          isOpen && (
            <div ref={menuRef} style={menuStyle} className={menuClassName}>
              {children({ close })}
            </div>
          )
        ),
        document.body,
      )}
    </>
  );
}
