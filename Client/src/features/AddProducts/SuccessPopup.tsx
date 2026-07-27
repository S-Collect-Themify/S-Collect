// pages/AddProduct/SuccessPopup.tsx
import { useTranslation } from 'react-i18next';

interface SuccessPopupProps {
  onClose: () => void;
  thumbnailUrl?: string;
  isEdit?: boolean;
}

const SuccessPopup = ({ onClose, thumbnailUrl, isEdit }: SuccessPopupProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-100 rounded-2xl bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {thumbnailUrl && (
          <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-xl border border-gray-100 shadow-md">
            <img
              src={thumbnailUrl}
              alt="Product Thumbnail"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h3 className="text-2xl font-bold">
          {isEdit
            ? t(
                'addProduct.productUpdatedSuccessfully',
                'Product Updated Successfully'
              )
            : t('addProduct.productAddedSuccessfully')}
        </h3>
        <p className="mt-2 text-gray-500">
          {isEdit
            ? t(
                'addProduct.productUpdatedMessage',
                'Your product has been updated successfully.'
              )
            : t('addProduct.productAddedMessage')}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700"
        >
          {t('addProduct.done')}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
