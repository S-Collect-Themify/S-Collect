import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import type { PendingPayoutItem } from '../../types';

interface PayoutAmountFieldProps {
  amountInput: string;
  onChangeAmount: (val: string) => void;
  item: PendingPayoutItem;
  isZeroOrNegative: boolean;
  isExceedsPending: boolean;
  hasValidationError: boolean;
}

export default function PayoutAmountField({
  amountInput,
  onChangeAmount,
  item,
  isZeroOrNegative,
  isExceedsPending,
  hasValidationError,
}: PayoutAmountFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {t('payouts.payoutAmountLabel', 'Payout Amount (SAR)')}
      </label>
      <input
        type="text"
        required
        value={amountInput}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChangeAmount(e.target.value)}
        className={`w-full h-12 px-4 border rounded-lg text-sm font-semibold transition-colors ${
          hasValidationError
            ? 'border-rose-600 bg-rose-50/50 text-rose-900 focus:outline-none focus:border-rose-600'
            : 'border-gray-200 text-gray-900 focus:outline-none focus:border-black'
        }`}
        placeholder="15,000.00"
      />

      {/* Validation Sub-text Messages */}
      {isExceedsPending && (
        <div className="flex items-start gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 animate-fade-in-up">
          <AlertCircle size={14} className="shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-tight">
            {t(
              'payouts.amountExceedsNotice',
              'The entered amount exceeds the current pending payout of {{max}} SAR. Please review.',
              {
                max: item.pendingPayout.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
              }
            )}
          </span>
        </div>
      )}

      {isZeroOrNegative && (
        <div className="flex items-start gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 animate-fade-in-up">
          <AlertCircle size={14} className="shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-tight">
            {t(
              'payouts.amountZeroNotice',
              'Enter a payout amount greater than 0 to proceed.'
            )}
          </span>
        </div>
      )}
    </div>
  );
}
