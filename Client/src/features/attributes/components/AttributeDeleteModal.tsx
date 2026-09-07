import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import type { AttributeDeleteTarget } from '../types';

interface AttributeDeleteModalProps {
  isOpen: boolean;
  target: AttributeDeleteTarget | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const AttributeDeleteModal = ({
  isOpen,
  target,
  onClose,
  onConfirm,
  isDeleting = false,
}: AttributeDeleteModalProps) => {
  const { t } = useTranslation();

  if (!isOpen || !target) return null;

  const isAttribute = target.type === 'attribute';

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl bg-white p-7 shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <Trash2 className="h-7 w-7" />
        </div>

        {/* Title */}
        <h3 className="text-center text-xl font-bold text-gray-900">
          {isAttribute
            ? t('attributes.deleteModal.attributeTitle', 'Delete Attribute')
            : t('attributes.deleteModal.valueTitle', 'Remove Attribute Value')}
        </h3>

        {/* Item highlight */}
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
          <p className="text-sm font-semibold text-gray-800">
            {isAttribute ? target.attributeName : target.valueName}
          </p>
          {!isAttribute && target.attributeName && (
            <p className="text-xs text-gray-500 mt-0.5">
              {t('attributes.deleteModal.parentAttr', 'From attribute: {{name}}', {
                name: target.attributeName,
              })}
            </p>
          )}
        </div>

        {/* Warning Note */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800 text-xs leading-relaxed">
          <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
          <p>
            {isAttribute
              ? t(
                  'attributes.deleteModal.attributeWarning',
                  'This attribute will be permanently removed. The deletion will fail if this attribute is actively attached to any product.'
                )
              : t(
                  'attributes.deleteModal.valueWarning',
                  'This value will be removed. The deletion will fail if any product variant is actively using this value.'
                )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {t('attributes.form.cancel', 'Cancel')}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t('attributes.deleteModal.deleting', 'Deleting...')}</span>
              </>
            ) : (
              <span>{t('attributes.deleteModal.confirmBtn', 'Yes, Delete')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
