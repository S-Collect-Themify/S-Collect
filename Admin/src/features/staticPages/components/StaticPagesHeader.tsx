import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const StaticPagesHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="py-2 flex flex-col-reverse">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          {t('staticPages.breadcrumb.dashboard', 'Dashboard')}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {t('staticPages.breadcrumb.staticPages', 'Static Pages')}
        </span>
      </nav>

      {/* Main Header Title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('staticPages.title', 'Static Pages')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'staticPages.subtitle',
              'Manage the content shown on Contact Us, FAQ, Return Policy, Terms & Conditions and Privacy Policy pages.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
