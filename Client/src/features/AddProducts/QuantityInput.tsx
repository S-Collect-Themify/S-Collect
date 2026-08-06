import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 10;

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
}

const QuantityInput = ({ value, onChange }: QuantityInputProps) => {
  const [direction, setDirection] = useState(1);

  const increase = () => {
    setDirection(1);
    onChange(value + 1);
  };

  const decrease = () => {
    setDirection(-1);
    onChange(Math.max(0, value - 1));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(0, Number(e.target.value));

    setDirection(newValue >= value ? 1 : -1);
    onChange(newValue);
  };

  return (
    <div>
      <label className="mb-2 block font-medium">
        Stock Quantity <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={decrease}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold transition hover:bg-gray-50 active:scale-95"
        >
          −
        </button>

        <div className="relative w-20 overflow-hidden">
          {/* Hidden input to allow typing */}
          <input
            type="number"
            value={value}
            min={0}
            onChange={handleInput}
            className="absolute inset-0 h-full w-full bg-transparent text-center text-transparent caret-black focus:outline-none"
          />

          {/* Animated number */}
          <div className="pointer-events-none flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={value}
                initial={{
                  y: direction > 0 ? 20 : -20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: direction > 0 ? -20 : 20,
                  opacity: 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 800,
                  damping: 55,
                }}
                className="text-base font-semibold"
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          onClick={increase}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold transition hover:bg-gray-50 active:scale-95"
        >
          +
        </button>
      </div>

      {value > 0 && value <= LOW_STOCK_THRESHOLD && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5 text-xs text-gray-600">
          <AlertCircle size={14} className="shrink-0 text-gray-500" />
          <span>
            Low stock alert will trigger at {LOW_STOCK_THRESHOLD} units.
          </span>
        </div>
      )}
    </div>
  );
};

export default QuantityInput;
