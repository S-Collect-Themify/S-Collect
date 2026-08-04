import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, PowerOff } from 'lucide-react';

interface VendorConfirmModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject' | 'deactivate' | 'reactivate';
  count: number;
  vendorName?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

/** Returns up to 2 uppercase initials from a business name */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function VendorConfirmModal({
  isOpen,
  type,
  count,
  vendorName,
  onConfirm,
  onCancel,
}: VendorConfirmModalProps) {
  const { t } = useTranslation();

  const isSingle = !!vendorName;

  const configs = {
    approve: {
      title: t('vendors.table.confirmApproveTitle', 'Approve Vendor'),
      message: isSingle
        ? t('vendors.table.confirmApproveMessage', { name: vendorName, defaultValue: `Are you sure you want to approve ${vendorName}?` })
        : t('vendors.table.confirmApproveBulkMessage', { count, defaultValue: `Are you sure you want to approve ${count} vendors?` }),
      icon: <CheckCircle size={28} className="text-green-600" strokeWidth={2} />,
      iconBg: 'bg-green-50',
      btnClass: 'bg-green-700 hover:bg-green-800',
      btnLabel: isSingle
        ? t('vendors.table.confirmApproveBtn', 'Approve')
        : t('vendors.table.approveSelected', 'Approve Selected'),
    },
    reactivate: {
      title: t('vendors.table.confirmReactivateTitle', 'Reactivate Vendor'),
      message: isSingle
        ? t('vendors.table.confirmReactivateMessage', { name: vendorName, defaultValue: `Are you sure you want to reactivate ${vendorName}?` })
        : t('vendors.table.confirmReactivateBulkMessage', { count, defaultValue: `Are you sure you want to reactivate ${count} vendors?` }),
      icon: <CheckCircle size={28} className="text-green-600" strokeWidth={2} />,
      iconBg: 'bg-green-50',
      btnClass: 'bg-green-700 hover:bg-green-800',
      btnLabel: isSingle
        ? t('vendors.table.confirmReactivateBtn', 'Reactivate')
        : t('vendors.table.reactivateSelected', 'Reactivate Selected'),
    },
    reject: {
      title: t('vendors.table.confirmRejectTitle', 'Reject Vendor'),
      message: isSingle
        ? t('vendors.table.confirmRejectMessage', { name: vendorName, defaultValue: `Are you sure you want to reject ${vendorName}?` })
        : t('vendors.table.confirmRejectBulkMessage', { count, defaultValue: `Are you sure you want to reject ${count} vendors?` }),
      icon: <AlertTriangle size={28} className="text-red-500" strokeWidth={2} />,
      iconBg: 'bg-red-50',
      btnClass: 'bg-red-500 hover:bg-red-600',
      btnLabel: isSingle
        ? t('vendors.table.confirmRejectBtn', 'Reject')
        : t('vendors.table.rejectSelected', 'Reject Selected'),
    },
    deactivate: {
      title: t('vendors.table.confirmDeactivateTitle', 'Deactivate Vendor'),
      message: isSingle
        ? t('vendors.table.confirmDeactivateSingleMessage', { name: vendorName, defaultValue: `Are you sure you want to deactivate ${vendorName}?` })
        : t('vendors.table.confirmDeactivateMessage', { count, defaultValue: `Are you sure you want to deactivate ${count} vendors?` }),
      icon: <PowerOff size={28} className="text-red-500" strokeWidth={2} />,
      iconBg: 'bg-red-50',
      btnClass: 'bg-red-600 hover:bg-red-700',
      btnLabel: isSingle
        ? t('vendors.table.confirmDeactivateBtn', 'Deactivate')
        : t('vendors.table.deactivateSelected', 'Deactivate Selected'),
    },
  };

  const cfg = configs[type];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${cfg.iconBg}`}
            >
              {cfg.icon}
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {cfg.title}
            </h2>

            {/* Vendor card — shown only for single-vendor actions */}
            {isSingle && vendorName && (
              <div className="w-full flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(vendorName)}
                </div>
                <span className="text-sm font-semibold text-gray-800 text-start">
                  {vendorName}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {cfg.message}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('vendors.table.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => onConfirm()}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${cfg.btnClass}`}
              >
                {cfg.btnLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
