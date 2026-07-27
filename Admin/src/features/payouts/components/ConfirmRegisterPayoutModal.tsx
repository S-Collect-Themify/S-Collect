import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface ConfirmRegisterPayoutModalProps {
  isOpen: boolean;
  vendorName?: string;
  amount?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmRegisterPayoutModal({
  isOpen,
  vendorName = '',
  amount = 0,
  onClose,
  onConfirm,
}: ConfirmRegisterPayoutModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-100 shadow-2xl border border-gray-100 text-center space-y-5">
        {/* Warning Icon Circle */}
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto shrink-0">
          <AlertTriangle size={24} className="text-amber-500" />
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
            {t('payouts.confirmRegisterTitle', 'Confirm Payout Registration')}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed px-2">
            {t(
              'payouts.confirmRegisterMessage',
              'Are you sure you want to register a payout of {{amount}} SAR for {{vendor}}? This action will record a manual payout entry.',
              {
                amount: amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
                vendor: vendorName,
              }
            )}
          </p>
        </div>

        {/* Action Buttons */}
        {/* Desktop: Side by Side (Cancel, Confirm). Mobile: Stacked (Confirm top, Cancel bottom) */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-1/2 h-11 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer order-2 md:order-1 flex items-center justify-center"
          >
            {t('payouts.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full md:w-1/2 h-11 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-bold shadow-2xs transition-all active:scale-95 cursor-pointer order-1 md:order-2 flex items-center justify-center"
          >
            {t('payouts.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
