import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import i18n from '../../../../i18n';

export interface SaveOrderBannerProps {
  isSavingOrder: boolean;
  onSaveOrder: () => void;
}

export const SaveOrderBanner: React.FC<SaveOrderBannerProps> = ({
  isSavingOrder,
  onSaveOrder,
}) => {
  const isArabic = i18n.language === 'ar';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-3 text-amber-900 text-sm font-semibold">
        <Save size={18} className="text-amber-600" />
        <span>
          {isArabic
            ? 'لقد قمت بتغيير ترتيب البانرات. انقر على حفظ الترتيب لتطبيق التغييرات.'
            : 'You have reordered the banners. Click save order to apply changes.'}
        </span>
      </div>
      <button
        type="button"
        onClick={onSaveOrder}
        disabled={isSavingOrder}
        className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
      >
        {isSavingOrder ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        <span>{isArabic ? 'حفظ الترتيب' : 'Save Banner Order'}</span>
      </button>
    </div>
  );
};
