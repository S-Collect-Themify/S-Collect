import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Check,
  CheckCheck,
  Plus,
  Palette,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { VendorAttribute } from '../../attributes/types';

const DEFAULT_POPULAR_COLORS = [
  { name: 'Black', nameAr: 'أسود', hex: '#111827' },
  { name: 'White', nameAr: 'أبيض', hex: '#FFFFFF' },
  { name: 'Navy', nameAr: 'كحلي', hex: '#1E3A8A' },
  { name: 'Gray', nameAr: 'رمادي', hex: '#6B7280' },
  { name: 'Beige', nameAr: 'بيج', hex: '#E5D3B3' },
  { name: 'Brown', nameAr: 'بني', hex: '#78350F' },
  { name: 'Blue', nameAr: 'أزرق', hex: '#3B82F6' },
  { name: 'Red', nameAr: 'أحمر', hex: '#EF4444' },
  { name: 'Green', nameAr: 'أخضر', hex: '#10B981' },
  { name: 'Pink', nameAr: 'وردي', hex: '#EC4899' },
  { name: 'Yellow', nameAr: 'أصفر', hex: '#FBBF24' },
  { name: 'Purple', nameAr: 'أرجواني', hex: '#8B5CF6' },
];

const DEFAULT_SIZE_LIST = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  'One Size',
];

interface AutoGenerateVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    color: string;
    sizes: string[];
    replaceExisting: boolean;
  }) => void;
  vendorAttributes?: VendorAttribute[];
  activeAttributes?: VendorAttribute[];
  hasExistingVariants?: boolean;
  isArabic?: boolean;
}

export const AutoGenerateVariantsModal = ({
  isOpen,
  onClose,
  onGenerate,
  vendorAttributes = [],
  activeAttributes = [],
  hasExistingVariants = false,
  isArabic = false,
}: AutoGenerateVariantsModalProps) => {
  const { t } = useTranslation();

  // Find pre-configured Color & Size attributes
  const colorAttribute = useMemo(() => {
    return (
      activeAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('color') ||
          a.nameAr?.includes('لون')
      ) ||
      vendorAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('color') ||
          a.nameAr?.includes('لون')
      )
    );
  }, [activeAttributes, vendorAttributes]);

  const sizeAttribute = useMemo(() => {
    return (
      activeAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('size') ||
          a.nameAr?.includes('مقاس')
      ) ||
      vendorAttributes.find(
        (a) =>
          a.name?.toLowerCase().includes('size') ||
          a.nameAr?.includes('مقاس')
      )
    );
  }, [activeAttributes, vendorAttributes]);

  // Available colors list: from attribute values + popular defaults
  const availableColors = useMemo(() => {
    const list: { name: string; nameAr?: string; hex?: string }[] = [];
    const seen = new Set<string>();

    if (colorAttribute?.values && colorAttribute.values.length > 0) {
      colorAttribute.values.forEach((v) => {
        const lower = v.value.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            name: v.value,
            nameAr: v.valueAr,
            hex: v.hexColor,
          });
        }
      });
    }

    DEFAULT_POPULAR_COLORS.forEach((c) => {
      const lower = c.name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(c);
      }
    });

    return list;
  }, [colorAttribute]);

  // Available sizes list: from attribute values + default size list
  const availableSizes = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    if (sizeAttribute?.values && sizeAttribute.values.length > 0) {
      sizeAttribute.values.forEach((v) => {
        if (!seen.has(v.value)) {
          seen.add(v.value);
          list.push(v.value);
        }
      });
    }

    DEFAULT_SIZE_LIST.forEach((s) => {
      if (!seen.has(s)) {
        seen.add(s);
        list.push(s);
      }
    });

    return list;
  }, [sizeAttribute]);

  // Modal State
  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0]?.name || 'Black'
  );
  const [customColorInput, setCustomColorInput] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    'S',
    'M',
    'L',
    'XL',
  ]);
  const [customSizeInput, setCustomSizeInput] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState<boolean>(!hasExistingVariants);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSelectAllSizes = () => {
    if (selectedSizes.length === availableSizes.length) {
      setSelectedSizes([]);
    } else {
      setSelectedSizes([...availableSizes]);
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  const handleApplyCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    setSelectedColor(trimmed);
  };

  const handleConfirm = () => {
    if (!selectedColor || selectedSizes.length === 0) return;
    onGenerate({
      color: selectedColor,
      sizes: selectedSizes,
      replaceExisting,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {t('addProduct.autoGenerateVariants', 'Auto Generate Variants')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t(
                    'addProduct.autoGenerateSubtitle',
                    'Select 1 color and multiple sizes to instantly generate variants'
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin text-xs">
            {/* Step 1: Select 1 Color */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-semibold text-gray-800 text-sm">
                  <Palette size={15} className="text-indigo-600" />
                  <span>{t('addProduct.selectColorTitle', '1. Select One Color')}</span>
                </label>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {isArabic ? 'المحدد:' : 'Selected:'}{' '}
                  <strong className="text-gray-900">{selectedColor}</strong>
                </span>
              </div>

              {/* Color Swatch Pills Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/40 scrollbar-thin">
                {availableColors.map((c) => {
                  const isSelected =
                    selectedColor.toLowerCase() === c.name.toLowerCase();
                  const label =
                    isArabic && c.nameAr ? `${c.nameAr} (${c.name})` : c.name;

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setCustomColorInput('');
                      }}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer border text-start ${
                        isSelected
                          ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      {c.hex ? (
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0 border border-gray-300 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full shrink-0 bg-gray-300 border border-gray-400" />
                      )}
                      <span className="truncate flex-1">{label}</span>
                      {isSelected && <Check size={12} className="shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={
                    isArabic ? 'أو اكتب لوناً مخصصاً...' : 'Or enter custom color...'
                  }
                  value={customColorInput}
                  onChange={(e) => {
                    setCustomColorInput(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedColor(e.target.value.trim());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCustomColor();
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                />
                {customColorInput && (
                  <button
                    type="button"
                    onClick={handleApplyCustomColor}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition cursor-pointer"
                  >
                    {isArabic ? 'تطبيق' : 'Apply'}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Select Multiple Sizes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-semibold text-gray-800 text-sm">
                  <Layers size={15} className="text-indigo-600" />
                  <span>{t('addProduct.selectSizesTitle', '2. Select Sizes')}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    ({selectedSizes.length} {isArabic ? 'محدد' : 'selected'})
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllSizes}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    <CheckCheck size={13} />
                    <span>
                      {selectedSizes.length === availableSizes.length
                        ? t('addProduct.deselectAll', 'Deselect All')
                        : t('addProduct.selectAll', 'Select All')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sizes Pill Selection */}
              <div className="flex flex-wrap gap-2 p-2 border border-gray-100 rounded-xl bg-gray-50/40 max-h-36 overflow-y-auto scrollbar-thin">
                {availableSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <Check size={12} className="text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Size */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder={
                    isArabic ? 'أضف مقاساً آخر (مثال: 5XL, 38)...' : 'Add custom size (e.g. 5XL, 38)...'
                  }
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  disabled={!customSizeInput.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} />
                  <span>{isArabic ? 'إضافة' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* Step 3: Generation Preset Details */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-indigo-950 font-semibold text-xs">
                <span>{t('addProduct.generationPreview', 'Variants to be generated:')}</span>
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  {selectedSizes.length} {t('addProduct.variantsCount', 'variants')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-lg bg-white p-2 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.basePrice', 'Base Price')}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">0.00 SAR</div>
                </div>
                <div className="rounded-lg bg-white p-2 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.stockQuantity', 'Stock')}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">1 unit each</div>
                </div>
                <div className="rounded-lg bg-white p-2 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.sku', 'SKU')}
                  </div>
                  <div className="font-bold text-indigo-600 text-xs mt-0.5 truncate font-mono">
                    Random
                  </div>
                </div>
              </div>

              {hasExistingVariants && (
                <div className="pt-2 border-t border-indigo-100 flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      {isArabic
                        ? 'استبدال المتغيرات الموجودة حالياً في الجدول'
                        : 'Replace current variants in table'}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4 bg-gray-50/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              {t('addProduct.cancel', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedColor || selectedSizes.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {t('addProduct.generateButton', 'Auto Generate ({{count}})', {
                  count: selectedSizes.length,
                })}
              </span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
