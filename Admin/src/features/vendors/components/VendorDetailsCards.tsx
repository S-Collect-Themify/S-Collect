import type { ReactNode } from 'react';
import { motion, type Variants } from 'motion/react';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

/**
 * Returns up to 2 uppercase initials from a business or person name
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Card wrapper component with motion animations
 */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={`bg-white rounded-lg border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * StatCard component displaying metric label, value, unit, and highlight status
 */
export function StatCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
}) {
  const displayVal =
    typeof value === 'number'
      ? value > 0
        ? value.toLocaleString()
        : '--'
      : value || '--';

  return (
    <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p
        className={`text-xl font-bold truncate ${
          highlight ? 'text-amber-600' : 'text-gray-900'
        }`}
      >
        {displayVal}
        {unit && displayVal !== '--' && (
          <span className="text-xs font-normal text-gray-400 ms-1">{unit}</span>
        )}
      </p>
    </div>
  );
}
