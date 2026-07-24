import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface VoucherHeaderProps {
  titleKey?: string;
  breadcrumbType?: 'list' | 'create' | 'edit';
  showCreateButton?: boolean;
}

export const VoucherHeader = ({
  titleKey = 'vouchersListing.title',
  breadcrumbType = 'list',
  showCreateButton = true,
}: VoucherHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="py-2">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          {t('vouchersListing.breadcrumb.dashboard')}
        </Link>
        <span>/</span>
        {breadcrumbType === 'list' ? (
          <span className="text-gray-900 font-medium">
            {t('vouchersListing.breadcrumb.vouchers')}
          </span>
        ) : (
          <>
            <Link to="/vouchers" className="hover:text-gray-600 transition-colors">
              {t('vouchersListing.breadcrumb.vouchers')}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {breadcrumbType === 'create'
                ? t('vouchersListing.breadcrumb.create')
                : t('vouchersListing.breadcrumb.edit')}
            </span>
          </>
        )}
      </nav>

      {/* Main Header Title & Action Button */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t(titleKey)}</h1>

        {showCreateButton && (
          <button
            type="button"
            onClick={() => navigate('/vouchers/create')}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
              {t('vouchersListing.createButton')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
