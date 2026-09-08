import { create } from 'zustand';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

const getInitialThreshold = (): number => {
  if (typeof window === 'undefined') return DEFAULT_LOW_STOCK_THRESHOLD;
  try {
    const stored = localStorage.getItem('vendor_low_stock_threshold');
    if (!stored) return DEFAULT_LOW_STOCK_THRESHOLD;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) || parsed < 1 ? DEFAULT_LOW_STOCK_THRESHOLD : parsed;
  } catch {
    return DEFAULT_LOW_STOCK_THRESHOLD;
  }
};

interface InventorySettingsState {
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
}

export const useInventorySettingsStore = create<InventorySettingsState>((set) => ({
  lowStockThreshold: getInitialThreshold(),
  setLowStockThreshold: (threshold: number) => {
    const validValue = Math.max(1, Math.floor(threshold));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vendor_low_stock_threshold', String(validValue));
      } catch (err) {
        console.warn('Failed to save low stock threshold to localStorage:', err);
      }
    }
    set({ lowStockThreshold: validValue });
  },
}));
