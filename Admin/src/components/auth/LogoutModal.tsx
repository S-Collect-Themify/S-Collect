import { LoaderCircle, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface LogoutModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({
  open,
  loading,
  onClose,
  onConfirm,
}: LogoutModalProps) => {
  const { t } = useTranslation();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <LogOut className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-semibold">
          {t('sidebar.items.logout')}
        </h2>

        <p className="mt-3 text-center text-sm text-gray-500 whitespace-pre-line leading-relaxed">
          {t('sidebar.items.logoutDescription')}
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 py-3 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {t('sidebar.items.signingOut')}
              </span>
            ) : (
              t('sidebar.items.signOut')
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border py-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t('sidebar.items.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;
