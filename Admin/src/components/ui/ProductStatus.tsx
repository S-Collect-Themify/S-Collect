import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface ProductStatusProps {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

const ProductStatus = ({ enabled, setEnabled }: ProductStatusProps) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);

  const handleToggle = (value: boolean) => {
    setPendingValue(value);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setEnabled(pendingValue);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div>
      {/* Confirmation Popup */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={handleCancel}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full"
            >
              {/* أيقونة التحذير */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>

              {/* العنوان */}
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                {pendingValue
                  ? t('addProduct.activateProduct', 'Activate Product?')
                  : t('addProduct.deactivateProduct', 'Deactivate Product?')}
              </h3>

              {/* الوصف */}
              <p className="text-sm text-gray-500 text-center mb-6">
                {pendingValue
                  ? t(
                      'addProduct.activateConfirm',
                      'Are you sure you want to activate this product? It will be visible to customers.'
                    )
                  : t(
                      'addProduct.deactivateConfirm',
                      'Are you sure you want to deactivate this product? It will be hidden from customers.'
                    )}
              </p>

              {/* الأزرار */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('addProduct.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                    pendingValue
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {pendingValue
                    ? t('addProduct.activate', 'Activate')
                    : t('addProduct.deactivate', 'Deactivate')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h6 className="font-semibold">{t('addProduct.productStatus')}</h6>

          <Switch
            checked={enabled}
            onChange={handleToggle}
            className={`${
              enabled ? 'bg-green' : 'bg-gray-300'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                enabled
                  ? 'translate-x-6 rtl:-translate-x-6'
                  : 'translate-x-1 rtl:-translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm text-gray-500">
            {t('addProduct.visibility', 'Visibility')}
          </h3>
          <label className="flex gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
              aria-label={t('addProduct.homepage')}
              defaultChecked
            />
            {t('addProduct.homepage')}
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
              aria-label={t('addProduct.promotions')}
              defaultChecked
            />
            {t('addProduct.promotions')}
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-black"
              aria-label={t('addProduct.searchResults')}
              defaultChecked
            />
            {t('addProduct.searchResults')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductStatus;