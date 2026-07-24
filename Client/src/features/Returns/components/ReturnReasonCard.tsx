import { useTranslation } from 'react-i18next';
import { type ReturnItem } from '../types';

interface ReturnReasonCardProps {
  item: ReturnItem;
  internalNote: string;
  setInternalNote: (note: string) => void;
}

export function ReturnReasonCard({ item, internalNote, setInternalNote }: ReturnReasonCardProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Return Reason */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {t('returnsPage.returnReason', { defaultValue: 'Return Reason' })}: <span className="text-amber-600 font-bold">{item.reason}</span>
        </h2>
        {item.customerNote && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-gray-700 leading-relaxed italic">
            {item.customerNote}
          </div>
        )}
      </div>

      {/* Customer Uploaded Images */}
      {item.uploadedImages && item.uploadedImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {t('returnsPage.uploadedImages', { defaultValue: 'Customer Uploaded Images (Product Condition)' })}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {item.uploadedImages.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt={`Condition ${i + 1}`}
                className="w-full h-28 sm:h-32 rounded-xl object-cover border border-gray-200 shadow-xs hover:scale-[1.02] transition-transform cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}

      {/* Internal Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          {t('returnsPage.internalNotes', { defaultValue: 'Internal Notes (Only visible to you)' })}
        </h2>
        <textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder={t('returnsPage.notesPlaceholder', { defaultValue: 'Add notes about this return request...' })}
          className="w-full h-28 p-3.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-gray-900 transition-colors resize-none bg-gray-50/50"
        />
      </div>
    </div>
  );
}
