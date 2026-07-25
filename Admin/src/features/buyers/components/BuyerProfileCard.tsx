import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import type { Buyer } from '../types/buyers';
import { getInitials } from '../utils/buyerUtils';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

interface BuyerProfileCardProps {
  buyer: Buyer;
  isMobile: boolean;
}

export default function BuyerProfileCard({ buyer, isMobile }: BuyerProfileCardProps) {
  const { t } = useTranslation();
  const initials = getInitials(buyer.name);

  if (isMobile) {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-2xs"
      >
        <div className="w-16 h-16 rounded-full bg-[#E9E9E9] text-gray-900 font-bold text-xl flex items-center justify-center mb-3 shrink-0">
          {initials}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">{buyer.name}</h2>
        <p className="text-xs text-gray-400 mb-2">{buyer.email}</p>
        <p className="text-xs text-gray-500 mb-2">
          {t('buyers.details.registrationDate', 'Registration Date:')}{' '}
          <strong className="font-semibold text-gray-800">{buyer.date}</strong>
        </p>
        {buyer.location && (
          <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <MapPin size={12} className="shrink-0" />
            <span>{buyer.location}</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{buyer.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{buyer.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            {t('buyers.details.registrationDate', 'Registration Date:')} {buyer.date}
          </p>
          {buyer.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium">
              <MapPin size={13} className="shrink-0" />
              <span>{buyer.location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
