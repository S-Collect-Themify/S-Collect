import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationTriggerProps {
  unreadCount: number;
  isOpen: boolean;
  toggle: () => void;
}

export const NotificationTrigger = ({
  unreadCount,
  isOpen,
  toggle,
}: NotificationTriggerProps) => {
  return (
    <button
      onClick={toggle}
      type="button"
      aria-label="Notifications"
      className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-gray-800 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none shrink-0 ${
        isOpen ? 'ring-2 ring-purple-500/20 bg-gray-50' : ''
      }`}
    >
      <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-700 transition-transform duration-200" />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 bg-red-500 text-white text-[10px] sm:text-[11px] font-bold rounded-full border-2 border-white shadow-xs pointer-events-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
