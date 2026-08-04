import React, { useState } from 'react';
import { ServerOff, RefreshCw, RotateCw, ChevronDown, ChevronUp, AlertCircle, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export interface CategoryErrorStateProps {
  error?: string | null;
  rawError?: any;
  refetch: () => void;
  isFetching?: boolean;
}

export const CategoryErrorState: React.FC<CategoryErrorStateProps> = ({
  error,
  rawError,
  refetch,
  isFetching = false,
}) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  // Extract status code & message from raw error if available
  const statusCode = rawError?.response?.status || (error?.includes('502') ? 502 : null);
  const statusText = rawError?.response?.statusText || (statusCode === 502 ? 'Bad Gateway' : null);
  const errorMessage =
    rawError?.response?.data?.message ||
    rawError?.message ||
    error ||
    t('categories.errorState.description', 'The server encountered an error while fetching categories.');

  const is502 = statusCode === 502 || errorMessage?.includes('502');

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full py-8 px-4 flex justify-center items-center"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl border border-rose-100/80 shadow-xl shadow-rose-500/5 p-8 md:p-10 text-center relative overflow-hidden">
        {/* Subtle top decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon Container */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-3xl bg-rose-100/60 animate-ping opacity-25" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 via-rose-100/50 to-amber-50 border border-rose-200/60 flex items-center justify-center shadow-inner text-rose-600">
            {is502 ? (
              <ServerOff className="w-10 h-10 stroke-[1.75]" />
            ) : (
              <WifiOff className="w-10 h-10 stroke-[1.75]" />
            )}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white" />
            </span>
          </div>
        </div>

        {/* Error Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>
            {is502
              ? t('categories.errorState.badge', 'Error 502 • Bad Gateway')
              : statusCode
              ? t('categories.errorState.serverErrorBadge', { code: statusCode, defaultValue: `HTTP ${statusCode} Error` })
              : t('categories.errorState.networkErrorBadge', 'Connection Error')}
          </span>
        </div>

        {/* Main Heading */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          {t('categories.errorState.title', 'Unable to Load Categories')}
        </h3>

        {/* User-friendly message */}
        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-7">
          {is502
            ? t(
                'categories.errorState.description502',
                'The server is currently unable to handle the request due to a gateway communication error (502 Bad Gateway). Please try again in a few moments.'
              )
            : t(
                'categories.errorState.description',
                'We encountered an issue connecting to the server. Please verify your connection or try again.'
              )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>
              {isFetching
                ? t('categories.errorState.retrying', 'Retrying...')
                : t('categories.errorState.retry', 'Try Again')}
            </span>
          </button>

          <button
            onClick={handleReload}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-gray-500" />
            <span>{t('categories.errorState.reload', 'Reload Page')}</span>
          </button>
        </div>

        {/* Technical Details Toggle */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium cursor-pointer"
          >
            <span>{t('categories.errorState.technicalDetails', 'Technical Details')}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-3.5 bg-gray-900 text-gray-300 rounded-xl text-[11px] font-mono text-left dir-ltr space-y-1 border border-gray-800 shadow-inner overflow-x-auto">
                  <div className="flex gap-2">
                    <span className="text-rose-400 font-semibold">Status:</span>
                    <span>{statusCode || 'Unknown'}</span>
                    {statusText && <span className="text-gray-500">({statusText})</span>}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-semibold">Endpoint:</span>
                    <span className="text-gray-400">/admin/categories</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-cyan-400 font-semibold">Message:</span>
                    <span className="text-gray-300 break-all">{errorMessage}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryErrorState;
