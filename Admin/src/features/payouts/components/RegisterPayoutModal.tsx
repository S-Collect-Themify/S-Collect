import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { PendingPayoutItem } from '../types';
import PayoutVendorSummaryBlock from './registerModal/PayoutVendorSummaryBlock';
import PayoutAmountField from './registerModal/PayoutAmountField';

interface RegisterPayoutModalProps {
  isOpen: boolean;
  item: PendingPayoutItem | null;
  onClose: () => void;
  onRequestConfirm: (id: string, amount: number, notes: string, date: string) => void;
}

export default function RegisterPayoutModal({
  isOpen,
  item,
  onClose,
  onRequestConfirm,
}: RegisterPayoutModalProps) {
  const { t } = useTranslation();

  const [amountInput, setAmountInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    if (item) {
      setAmountInput(item.pendingPayout.toString());
      setNotesInput('');
      setDateInput(new Date().toISOString().split('T')[0]);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const cleanedAmount = amountInput.replace(/,/g, '').trim();
  const parsedAmount = parseFloat(cleanedAmount);

  const isZeroOrNegative = isNaN(parsedAmount) || parsedAmount <= 0;
  const isExceedsPending = !isNaN(parsedAmount) && parsedAmount > item.pendingPayout;
  const hasValidationError = isZeroOrNegative || isExceedsPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isZeroOrNegative) {
      toast.error(t('payouts.amountZeroNotice', 'Enter a payout amount greater than 0 to proceed.'));
      return;
    }

    if (isExceedsPending) {
      toast.error(
        t(
          'payouts.amountExceedsNotice',
          'The entered amount exceeds the current pending payout of {{max}} SAR. Please review.',
          {
            max: item.pendingPayout.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          }
        )
      );
      return;
    }

    onRequestConfirm(item.id, parsedAmount, notesInput, dateInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 md:p-7 w-full max-w-[440px] shadow-2xl border border-gray-100 space-y-5">
        {/* Header Title & Close Button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
            {t('payouts.registerModalTitle', 'Register Payout')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Information Summary Block */}
          <PayoutVendorSummaryBlock item={item} />

          {/* Payout Amount Field with Inline Validation */}
          <PayoutAmountField
            amountInput={amountInput}
            onChangeAmount={setAmountInput}
            item={item}
            isZeroOrNegative={isZeroOrNegative}
            isExceedsPending={isExceedsPending}
            hasValidationError={hasValidationError}
          />

          {/* Notes / Reference Field */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              {t('payouts.notesRefLabel', 'Notes / Reference #')}
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-black transition-colors"
              placeholder={t('payouts.notesPlaceholder', 'e.g. Transfer #12345')}
            />
          </div>

          {/* Payout Date Field */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              {t('payouts.payoutDateLabel', 'Payout Date')}
            </label>
            <input
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-black transition-colors bg-white"
            />
          </div>

          {/* Amber Manual Record Warning Notice Box (Shown when NO validation error) */}
          {!hasValidationError && (
            <div className="bg-amber-50/80 border border-amber-100/50 rounded-xl p-3.5 text-xs text-amber-700 font-medium leading-relaxed">
              {t(
                'payouts.manualRecordNotice',
                'This is a manual record only. No bank transfer will be initiated by the platform.'
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 h-11 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center order-2 sm:order-1"
            >
              {t('payouts.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={hasValidationError}
              className={`w-full sm:w-1/2 h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center order-1 sm:order-2 ${
                hasValidationError
                  ? 'bg-gray-200 text-gray-400 border border-transparent shadow-none cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-2xs active:scale-95'
              }`}
            >
              {t('payouts.registerPayoutAction', 'Register Payout')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
