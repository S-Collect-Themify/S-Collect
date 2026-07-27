// pages/AddProduct/StepSummary.tsx
import { CircleCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { label: 'Basic Info' },
  { label: 'Categorization' },
  { label: 'Pricing' },
  { label: 'Inventory' },
  { label: 'Review' },
];

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

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 p-5 bg-white">
        <h5 className="mb-4 font-semibold text-gray-800">Step Summary</h5>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div key={step.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{step.label}</span>
              <CircleCheckBig size={18} className="text-green-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onPrevious}
          disabled={isPublishing}
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-50 cursor-pointer w-full disabled:opacity-50"
        >
          {t('addProduct.previous')}
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="rounded-xl bg-gray-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer w-full flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {t('addProduct.publishing', 'Publishing...')}
            </>
          ) : (
            t('addProduct.publish')
          )}
        </button>
      </div>
    </div>
  );
};

export default StepSummary;
