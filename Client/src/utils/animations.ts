import type { Variants } from 'motion/react';

/**
 * Standard container variants for staggered children entrance animations.
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/**
 * Creates custom container variants with configurable stagger and delay timing.
 */
export const createContainerVariants = (
  staggerChildren = 0.08,
  delayChildren = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren, delayChildren },
  },
});

/**
 * Standard item variants for smooth spring-based fade and slide-up entrance.
 */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

/**
 * Creates custom item variants with configurable vertical offset.
 */
export const createItemVariants = (yOffset = 16): Variants => ({
  hidden: { opacity: 0, y: yOffset },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
});
