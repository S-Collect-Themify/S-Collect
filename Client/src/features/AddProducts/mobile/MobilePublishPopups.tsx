// pages/AddProduct/mobile/MobilePublishPopups.tsx
import { useTranslation } from 'react-i18next';

// Loading popup
export const MobileLoadingPopup = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-0">
      <div className="w-full rounded-t-3xl bg-white px-6 py-8 text-center shadow-xl">
        {/* Spinner */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center">
          <svg
            className="h-10 w-10 animate-spin text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900">
          {t('addProduct.mobile.addingProduct')}
        </h3>
        <p className="mt-1.5 text-sm text-gray-400">
          {t('addProduct.mobile.pleaseWait')}
        </p>

        {/* Disabled button during loading */}
        <button
          disabled
          className="mt-6 w-full rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
        >
          {t('addProduct.mobile.adding')}
        </button>
      </div>
    </div>
  );
};

// Success popup
interface MobileSuccessPopupProps {
  onClose: () => void;
  thumbnailUrl?: string;
}

export const MobileSuccessPopup = ({
  onClose,
  thumbnailUrl,
}: MobileSuccessPopupProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-0">
      <div className="w-full rounded-t-3xl bg-white px-6 py-8 text-center shadow-xl">
        {/* Success icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {thumbnailUrl && (
          <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <img
              src={thumbnailUrl}
              alt="Product Thumbnail"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h3 className="text-lg font-bold text-gray-900">
          {t('addProduct.mobile.productAddedSuccessfully')}
        </h3>
        <p className="mt-1.5 text-sm text-gray-400">
          {t('addProduct.mobile.productAddedMessage')}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600 active:scale-[0.98]"
        >
          {t('addProduct.mobile.done')}
        </button>
      </div>
    </div>
  );
};
