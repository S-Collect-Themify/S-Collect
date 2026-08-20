import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMobileAddProductStore } from './mobileAddProductStore';

const STEPS = [
  { key: 'basicInfo', defaultLabel: 'Basic Info' },
  { key: 'inventory', defaultLabel: 'Variants' },
  { key: 'publish', defaultLabel: 'Publish' },
];

const MobileStepIndicator = () => {
  const { t } = useTranslation();
  const currentStep = useMobileAddProductStore((state) => state.step);

  return (
    <div className="mb-6 w-full px-1">
      <div className="flex items-start justify-between w-full">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={step.key}
              className={`flex items-start ${
                index < STEPS.length - 1 ? 'flex-1' : 'flex-none'
              }`}
            >
              {/* Circle + Label */}
              <div className="flex flex-col items-center min-w-[64px]">
                <motion.div
                  layout
                  animate={{
                    scale: isActive ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 18,
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted || isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <motion.svg
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 20,
                      }}
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <motion.span
                      key={stepNumber}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {stepNumber}
                    </motion.span>
                  )}
                </motion.div>

                <motion.span
                  animate={{
                    color: isCompleted
                      ? '#22c55e'
                      : isActive
                        ? '#111827'
                        : '#9ca3af',
                  }}
                  transition={{ duration: 0.25 }}
                  className="mt-1.5 text-center text-[11px] font-medium leading-tight whitespace-nowrap"
                >
                  {t(`addProduct.steps.${step.key}`, step.defaultLabel)}
                </motion.span>
              </div>

              {/* Connecting line aligned to circle center */}
              {index < STEPS.length - 1 && (
                <div className="relative mt-3.5 mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{
                      duration: 0.45,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-0 top-0 h-full bg-green-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileStepIndicator;
