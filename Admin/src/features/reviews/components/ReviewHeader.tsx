import { useTranslation } from 'react-i18next';

interface ReviewHeaderProps {
  isMobile?: boolean;
}

export const ReviewHeader = ({ isMobile = false }: ReviewHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between py-2">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isMobile ? t('reviewsListing.mobileTitle') : t('reviewsListing.title')}
      </h1>
    </div>
  );
};
