// pages/AddProduct/StepSummary.tsx
import { CircleCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StepSummaryProps {
  onPrevious: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

const StepSummary = ({
  onPrevious,
  onPublish,
  isPublishing,
}: StepSummaryProps) => {
  const { t } = useTranslation();

  const steps = [
    { key: 'basicInfo', label: t('addProduct.stepSummary.basicInfo', 'Basic Info') },
    { key: 'categorization', label: t('addProduct.stepSummary.categorization', 'Categorization') },
    { key: 'pricing', label: t('addProduct.stepSummary.pricing', 'Pricing') },
    { key: 'inventory', label: t('addProduct.stepSummary.inventory', 'Inventory') },
    { key: 'review', label: t('addProduct.stepSummary.review', 'Review') },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 p-6 bg-white flex flex-col justify-between h-full shadow-xs">
      <div>
        <h3 className="mb-6 font-bold text-gray-900 text-base">
          {t('addProduct.stepSummary.title', 'Step Summary')}
        </h3>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">{step.label}</span>
              <CircleCheckBig size={20} className="text-emerald-500 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPublishing}
          className="w-1/2 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
        >
          {t('addProduct.previous', 'Previous')}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="w-1/2 rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {t('addProduct.publishing', 'Publishing...')}
            </>
          ) : (
            t('addProduct.publish', 'Publish')
          )}
        </button>
      </div>
    </div>
  );
};

export default StepSummary;
