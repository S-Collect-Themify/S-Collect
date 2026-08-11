import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EditModalTarget } from '../types';

interface EditCommissionModalProps {
  isOpen: boolean;
  target: EditModalTarget | null;
  onClose: () => void;
  onRequestConfirm: (
    id: string,
    type: 'platform' | 'vendor' | 'category',
    newRate: number
  ) => void;
  onReset?: (id: string, type: 'vendor' | 'category') => void;
}

export default function EditCommissionModal({
  isOpen,
  target,
  onClose,
  onRequestConfirm,
  onReset,
}: EditCommissionModalProps) {
  const { t } = useTranslation();

  const [rateInput, setRateInput] = useState('');

  useEffect(() => {
    if (target) {
      setRateInput(`${(target.currentRate ?? 0).toFixed(2)}%`);
    }
  }, [target]);

  if (!isOpen || !target) return null;

  const cleanedRate = rateInput.replace('%', '').trim();
  const parsedRate = parseFloat(cleanedRate);
  const isExceedsLimit = !isNaN(parsedRate) && parsedRate > 100;
  const isInvalidRate = !isNaN(parsedRate) && parsedRate <= 0;
  const isHasError = isExceedsLimit || isInvalidRate || isNaN(parsedRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isHasError) {
      toast.error(
        t(
          'commissionRates.rateValidationError',
          'Commission rate must be greater than 0% and up to 100%'
        )
      );
      return;
    }

    onRequestConfirm(target.id, target.type, parsedRate);
  };

  const isPlatform = target.type === 'platform';
  const isVendor = target.type === 'vendor';
  const isCategory = target.type === 'category';

  const getModalTitle = () => {
    if (isVendor) return t('commissionRates.setVendorTitle', 'Set Vendor Commission Rate');
    if (isCategory) return t('commissionRates.setCategoryTitle', 'Set Category Commission Rate');
    return t('commissionRates.editDefaultTitle', 'Edit Default Commission Rate');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 md:p-7 w-full max-w-105 shadow-2xl border border-gray-100 space-y-5">
        {/* Header Title & Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
            {getModalTitle()}
          </h2>
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
          {/* Details Rows */}
          <div className="space-y-2 text-sm py-1">
            {/* Vendor / Category Name Row */}
            {!isPlatform && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  {isVendor
                    ? t('commissionRates.vendorLabel', 'Vendor')
                    : t('commissionRates.categoryLabel', 'Category')}
                </span>
                <span className="font-bold text-gray-900">{target.name}</span>
              </div>
            )}

            {/* Current Rate Row */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">
                {isPlatform
                  ? t('commissionRates.currentGlobalRate', 'Current Global Rate')
                  : t('commissionRates.currentRateLabel', 'Current Rate')}
              </span>
              <span className="font-bold text-gray-900">
                {target.currentRate.toFixed(2)}%
                {target.currentStatus ? ` (${target.currentStatus})` : ''}
              </span>
            </div>
          </div>

          {/* New Rate Input */}
          <div>
            <label htmlFor="custom-rate-input" className="block text-sm font-bold text-gray-900 mb-2">
              {isVendor || isCategory
                ? t('commissionRates.customCommissionRate', 'Custom Commission Rate (%)')
                : t('commissionRates.newCommissionRate', 'New Commission Rate (%)')}
            </label>
            <input
              id="custom-rate-input"
              type="text"
              required
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className={`w-full h-12 px-4 border rounded-lg text-sm font-semibold transition-colors placeholder-gray-500 ${
                isHasError
                  ? 'border-rose-600 bg-rose-50/50 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-gray-200 text-gray-900 focus:outline-none focus:border-black'
              }`}
              placeholder="12.00%"
            />

            {/* Direct Sub-input Validation Error Message */}
            {isHasError && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-rose-600 animate-fade-in-up">
                <AlertCircle size={14} className="shrink-0 text-rose-600" />
                <span>
                  {t(
                    'commissionRates.rateValidationError',
                    'Commission rate must be greater than 0% and up to 100%'
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Override / Info Callout Boxes (Shown when NO error) */}
          {!isHasError && (
            <>
              {isVendor && (
                <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-3.5 text-xs text-rose-500 font-medium leading-relaxed">
                  {t(
                    'commissionRates.vendorOverrideNotice',
                    'This rate overrides the default platform rate for this vendor.'
                  )}
                </div>
              )}

              {isCategory && (
                <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-3.5 text-xs text-rose-500 font-medium leading-relaxed">
                  {t(
                    'commissionRates.categoryOverrideNotice',
                    'This rate overrides the default platform rate for this category.'
                  )}
                </div>
              )}

              {isPlatform && (
                <div className="bg-blue-50/80 border border-blue-100/50 rounded-lg p-3.5 text-xs text-blue-600 font-medium leading-relaxed">
                  {t(
                    'commissionRates.infoNotice',
                    'This rate will apply to all new orders for vendors without a custom rate.'
                  )}
                </div>
              )}
            </>
          )}

          {/* Action Buttons: Cancel, Reset to Default (if custom), Save */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 h-11 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center"
              >
                {t('commissionRates.cancel', 'Cancel')}
              </button>

              {target.hasCustomRate && onReset && (
                <button
                  type="button"
                  onClick={() => {
                    onReset(target.id, target.type as 'vendor' | 'category');
                    onClose();
                  }}
                  className="w-full sm:w-auto px-3 h-11 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  {t('commissionRates.resetToDefault', 'Reset to Default')}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isHasError}
              className={`w-full sm:w-auto px-5 h-11 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                isHasError
                  ? 'bg-gray-200 text-gray-400 border border-transparent shadow-none cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-2xs active:scale-95'
              }`}
            >
              {isVendor || isCategory
                ? t('commissionRates.saveRate', 'Save Rate')
                : t('commissionRates.saveChanges', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
