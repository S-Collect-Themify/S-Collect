import { useState } from 'react';
import { X, AlertTriangle, Trash2, PackageX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types';
import { toSlug } from '../utils';
import Toggle from './Toggle';

// ─── Status Confirmation Modal ─────────────────────────────────────────────────
export interface StatusConfirmModalProps {
  isOpen: boolean;
  categoryName: string;
  currentStatus: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StatusConfirmModal = ({
  isOpen,
  categoryName,
  currentStatus,
  onClose,
  onConfirm,
}: StatusConfirmModalProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="status-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="px-6 pt-8 pb-6 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>

              <h3 className="text-label-lg font-semibold text-gray-900 mb-2">
                {t('categories.statusModal.title')}
              </h3>
              <p className="text-body-sm text-gray-500 mb-6 leading-relaxed">
                {t('categories.statusModal.confirmMessage')}
                <span className={`font-semibold ${currentStatus ? 'text-red' : 'text-green'}`}>
                  {currentStatus ? t('categories.statusModal.deactivate') : t('categories.statusModal.activate')}
                </span>{' '}
                &ldquo;{categoryName}&rdquo;
                {t('categories.statusModal.confirmMessageEnd')}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-label-md font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {t('categories.modal.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 rounded-xl text-white text-label-md font-semibold active:scale-[0.98] transition-all cursor-pointer ${
                    currentStatus
                      ? 'bg-red hover:bg-red/90'
                      : 'bg-green hover:bg-green/90'
                  }`}
                >
                  {currentStatus ? t('categories.statusModal.deactivateBtn') : t('categories.statusModal.activateBtn')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
export interface DeleteModalProps {
  isOpen: boolean;
  categoryName: string;
  count?: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal = ({ isOpen, categoryName, count, onClose, onConfirm }: DeleteModalProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="delete-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Close btn */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="px-6 pt-8 pb-6 text-center">
              {/* Icon */}
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-light">
                <Trash2 size={24} className="text-red" />
              </div>

              <h3 className="text-label-lg font-semibold text-gray-900 mb-2">
                {count && count > 1
                  ? t('categories.deleteModal.titlePlural', { count })
                  : t('categories.deleteModal.titleSingle')}
              </h3>
              <p className="text-body-sm text-gray-500 mb-6 leading-relaxed">
                {count && count > 1
                  ? t('categories.deleteModal.confirmPlural', { count })
                  : (
                    <>
                      {t('categories.deleteModal.confirmSingleStart')}
                      &ldquo;{categoryName}&rdquo;
                      {t('categories.deleteModal.confirmSingleEnd')}
                    </>
                  )
                }
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-label-md font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {t('categories.modal.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-red text-white text-label-md font-semibold hover:bg-red/90 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {t('categories.deleteModal.delete')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Category Form Modal ───────────────────────────────────────────────────────
export interface CategoryFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  category?: Category | null;
  categories: Category[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'productsCount'>) => void;
}

export const CategoryFormModal = ({
  isOpen,
  mode,
  category,
  categories,
  isSubmitting: isSubmittingProp,
  onClose,
  onSave,
}: CategoryFormModalProps) => {
  const { t } = useTranslation();
  const isSubmitting = isSubmittingProp ?? false;
  const [nameEn, setNameEn] = useState(category?.nameEn ?? '');
  const [nameAr, setNameAr] = useState(category?.nameAr ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [touchedEn, setTouchedEn] = useState(false);
  const [touchedAr, setTouchedAr] = useState(false);

  const isNameEnValid = nameEn.trim().length >= 2 && nameEn.trim().length <= 50;
  const isNameArValid = nameAr.trim().length >= 2 && nameAr.trim().length <= 50;

  const isDuplicateEn = categories.some(
    (c) => c.id !== category?.id && c.nameEn.trim().toLowerCase() === nameEn.trim().toLowerCase()
  );
  const isDuplicateAr = categories.some(
    (c) => c.id !== category?.id && c.nameAr.trim().toLowerCase() === nameAr.trim().toLowerCase()
  );
  const isDuplicate = isDuplicateEn || isDuplicateAr;

  const isValid = isNameEnValid && isNameArValid && !isDuplicate;

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    setTouchedEn(true);
    if (!slugManuallyEdited) {
      setSlug(toSlug(val));
    }
  };

  const handleNameArChange = (val: string) => {
    setNameAr(val);
    setTouchedAr(true);
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugManuallyEdited(true);
  };

  const handleSave = () => {
    if (!isValid) return;
    onSave({ nameEn: nameEn.trim(), nameAr: nameAr.trim(), slug, isActive });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="form-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h2 className="text-label-lg font-semibold text-gray-900">
                {mode === 'add' ? t('categories.modal.addCategory') : t('categories.modal.editCategory')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Category Name EN */}
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-1.5">
                  {t('categories.modal.nameEn')} <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  onBlur={() => setTouchedEn(true)}
                  placeholder={t('categories.modal.nameEnPlaceholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-body-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    touchedEn && !isNameEnValid
                      ? 'border-red focus:border-red focus:ring-red'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900'
                  }`}
                />
                {touchedEn && !isNameEnValid && (
                  <p className="text-xs text-red mt-1.5">
                    {t('categories.modal.nameLengthError')}
                  </p>
                )}
                {isDuplicateEn && (
                  <p className="text-xs text-red mt-1.5">
                    {t('categories.modal.duplicateError')}
                  </p>
                )}
              </div>

              {/* Category Name AR */}
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-1.5">
                  {t('categories.modal.nameAr')} <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => handleNameArChange(e.target.value)}
                  onBlur={() => setTouchedAr(true)}
                  placeholder={t('categories.modal.nameArPlaceholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-body-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
                    touchedAr && !isNameArValid
                      ? 'border-red focus:border-red focus:ring-red'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900'
                  }`}
                />
                {touchedAr && !isNameArValid && (
                  <p className="text-xs text-red mt-1.5">
                    {t('categories.modal.nameLengthError')}
                  </p>
                )}
                {isDuplicateAr && (
                  <p className="text-xs text-red mt-1.5">
                    {t('categories.modal.duplicateError')}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-1.5">
                  {t('categories.modal.slug')}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder={t('categories.modal.slugPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-gray-50/60"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <label className="text-body-sm font-medium text-gray-700">{t('categories.modal.status')}</label>
                <Toggle checked={isActive} onChange={setIsActive} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 space-y-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || isSubmitting}
                className="w-full py-3 rounded-xl bg-gray-950 text-white text-label-md font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  t('categories.modal.save')
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-label-md font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
              >
                {t('categories.modal.cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Cannot Delete Modal ───────────────────────────────────────────────────────
export interface CannotDeleteModalProps {
  isOpen: boolean;
  isBulk: boolean;
  categoryName?: string;
  productsCount?: number;
  onClose: () => void;
}

export const CannotDeleteModal = ({
  isOpen,
  isBulk,
  categoryName,
  productsCount,
  onClose,
}: CannotDeleteModalProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cannot-delete-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="px-6 pt-8 pb-7 text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-light">
                <PackageX size={28} className="text-red" />
              </div>

              {/* Title */}
              <h3 className="text-label-lg font-bold text-gray-900 mb-2">
                {t('categories.cannotDeleteModal.title')}
              </h3>

              {/* Body */}
              {isBulk ? (
                <p className="text-body-sm text-gray-500 leading-relaxed mb-5">
                  {t('categories.cannotDeleteModal.bulkBody')}
                </p>
              ) : (
                <p className="text-body-sm text-gray-500 leading-relaxed mb-5">
                  {t('categories.cannotDeleteModal.singleBodyPrefix')}
                  <span className="font-semibold text-gray-800">&ldquo;{categoryName}&rdquo;</span>
                  {t('categories.cannotDeleteModal.singleBodyMiddle')}
                  <span className="inline-flex items-center gap-1 font-bold text-red px-1.5 py-0.5 rounded-lg bg-red-light text-sm">
                    {productsCount} {productsCount === 1 ? t('categories.cannotDeleteModal.productUnit') : t('categories.cannotDeleteModal.productsUnit')}
                  </span>
                  {t('categories.cannotDeleteModal.singleBodySuffix')}
                </p>
              )}

              {/* Warning hint */}
              <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3.5 text-left mb-5">
                <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  {t('categories.cannotDeleteModal.warningHint')}
                </p>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gray-950 text-white text-label-md font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                {t('categories.cannotDeleteModal.gotIt')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
