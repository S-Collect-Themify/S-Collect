import { useState, useMemo, useEffect } from 'react';
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
  Tag,
  SlidersHorizontal,
  ArrowRight,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { VendorAttribute } from '../../attributes/types';
import type { VarianceCardData } from '../types';
import { resolveColorHex } from '../../../utils/colorResolver';
import { generateRandomSku } from '../utils';

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
  { name: 'Orange', nameAr: 'برتقالي', hex: '#F97316' },
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

export interface GeneratedVariantsData {
  cards: VarianceCardData[];
  attributeIds: string[];
  colors: string[];
  sizes: string[];
  replaceExisting: boolean;
}

export interface AutoGenerateVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GeneratedVariantsData) => void;
  vendorAttributes?: VendorAttribute[];
  activeAttributes?: VendorAttribute[];
  hasExistingVariants?: boolean;
  isArabic?: boolean;
}

const isColorAttribute = (attr: VendorAttribute): boolean => {
  const name = attr.name?.toLowerCase() || '';
  const nameAr = attr.nameAr || '';
  return name.includes('color') || nameAr.includes('لون');
};

const isSizeAttribute = (attr: VendorAttribute): boolean => {
  const name = attr.name?.toLowerCase() || '';
  const nameAr = attr.nameAr || '';
  return name.includes('size') || nameAr.includes('مقاس');
};

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((prev) => curr.map((item) => [...prev, item])),
    [[]]
  );
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

  // 1. Determine which attributes should be included in variant generation
  const [includedAttributeIds, setIncludedAttributeIds] = useState<string[]>([]);
  const [selectedValuesByAttr, setSelectedValuesByAttr] = useState<
    Record<string, string[]>
  >({});
  const [customValuesByAttr, setCustomValuesByAttr] = useState<
    Record<string, Array<{ value: string; valueAr?: string; hex?: string }>>
  >({});
  const [customInputByAttr, setCustomInputByAttr] = useState<
    Record<string, string>
  >({});
  const [replaceExisting, setReplaceExisting] = useState<boolean>(
    !hasExistingVariants
  );

  // Initialize included attributes from activeAttributes (or fallbacks) when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let initialIds: string[] = [];
    if (activeAttributes && activeAttributes.length > 0) {
      initialIds = activeAttributes.map((a) => a.id);
    } else if (vendorAttributes && vendorAttributes.length > 0) {
      initialIds = vendorAttributes.slice(0, 2).map((a) => a.id);
    }

    setIncludedAttributeIds(initialIds);
    setReplaceExisting(!hasExistingVariants);

    // Populate initial selections for included attributes
    const initialSelections: Record<string, string[]> = {};
    initialIds.forEach((id) => {
      const attr =
        activeAttributes.find((a) => a.id === id) ||
        vendorAttributes.find((a) => a.id === id);
      if (!attr) return;

      if (isColorAttribute(attr)) {
        initialSelections[id] = [
          attr.values?.[0]?.value || DEFAULT_POPULAR_COLORS[0].name,
        ];
      } else if (isSizeAttribute(attr)) {
        initialSelections[id] = ['S', 'M', 'L', 'XL'];
      } else {
        const configuredValues = (attr.values || []).map((v) => v.value);
        initialSelections[id] =
          configuredValues.length > 0
            ? configuredValues.slice(0, 4)
            : [];
      }
    });

    setSelectedValuesByAttr(initialSelections);
  }, [isOpen, activeAttributes, vendorAttributes, hasExistingVariants]);

  // Resolved list of VendorAttribute objects currently included
  const includedAttributes = useMemo(() => {
    return includedAttributeIds
      .map(
        (id) =>
          activeAttributes.find((a) => a.id === id) ||
          vendorAttributes.find((a) => a.id === id)
      )
      .filter((a): a is VendorAttribute => Boolean(a));
  }, [includedAttributeIds, activeAttributes, vendorAttributes]);

  // Unused vendor attributes that can be added into the generation
  const unusedVendorAttributes = useMemo(() => {
    return vendorAttributes.filter(
      (va) => !includedAttributeIds.includes(va.id)
    );
  }, [vendorAttributes, includedAttributeIds]);

  // Handle adding an unused attribute to generation
  const handleAddAttribute = (attrId: string) => {
    if (!attrId || includedAttributeIds.includes(attrId)) return;
    const attr = vendorAttributes.find((a) => a.id === attrId);
    if (!attr) return;

    setIncludedAttributeIds((prev) => [...prev, attrId]);

    // Set default selections
    setSelectedValuesByAttr((prev) => {
      if (prev[attrId] && prev[attrId].length > 0) return prev;
      let defaults: string[] = [];
      if (isColorAttribute(attr)) {
        defaults = [attr.values?.[0]?.value || DEFAULT_POPULAR_COLORS[0].name];
      } else if (isSizeAttribute(attr)) {
        defaults = ['S', 'M', 'L', 'XL'];
      } else {
        defaults = (attr.values || []).map((v) => v.value).slice(0, 4);
      }
      return { ...prev, [attrId]: defaults };
    });
  };

  // Handle removing an attribute from generation
  const handleRemoveAttribute = (attrId: string) => {
    if (includedAttributeIds.length <= 1) return;
    setIncludedAttributeIds((prev) => prev.filter((id) => id !== attrId));
  };

  // Toggle a value selection for a given attribute
  const toggleValue = (attrId: string, val: string) => {
    setSelectedValuesByAttr((prev) => {
      const current = prev[attrId] || [];
      const exists = current.some(
        (c) => c.toLowerCase() === val.toLowerCase()
      );
      const updated = exists
        ? current.filter((c) => c.toLowerCase() !== val.toLowerCase())
        : [...current, val];
      return { ...prev, [attrId]: updated };
    });
  };

  // Select all or Deselect all for a given attribute
  const handleSelectAllForAttr = (attrId: string, allVals: string[]) => {
    setSelectedValuesByAttr((prev) => {
      const current = prev[attrId] || [];
      if (current.length === allVals.length) {
        return { ...prev, [attrId]: [] };
      }
      return { ...prev, [attrId]: [...allVals] };
    });
  };

  // Add custom value to a specific attribute
  const handleAddCustomValue = (attr: VendorAttribute) => {
    const input = (customInputByAttr[attr.id] || '').trim();
    if (!input) return;

    const currentSelected = selectedValuesByAttr[attr.id] || [];
    const exists = currentSelected.some(
      (c) => c.toLowerCase() === input.toLowerCase()
    );

    if (!exists) {
      setSelectedValuesByAttr((prev) => ({
        ...prev,
        [attr.id]: [...(prev[attr.id] || []), input],
      }));

      const isColor = isColorAttribute(attr);
      setCustomValuesByAttr((prev) => ({
        ...prev,
        [attr.id]: [
          ...(prev[attr.id] || []),
          {
            value: input,
            hex: isColor ? resolveColorHex(input) : undefined,
          },
        ],
      }));
    }

    setCustomInputByAttr((prev) => ({ ...prev, [attr.id]: '' }));
  };

  // Get all available display values for an attribute
  const getAttributeDisplayValues = (attr: VendorAttribute) => {
    const isColor = isColorAttribute(attr);
    const isSize = isSizeAttribute(attr);

    if (isColor) {
      const list: { name: string; nameAr?: string; hex?: string }[] = [];
      const seen = new Set<string>();

      if (attr.values && attr.values.length > 0) {
        attr.values.forEach((v) => {
          const lower = v.value.toLowerCase().trim();
          if (!seen.has(lower)) {
            seen.add(lower);
            list.push({
              name: v.value,
              nameAr: v.valueAr,
              hex: resolveColorHex(v.value, v.valueAr, v.hexColor),
            });
          }
        });
      }

      DEFAULT_POPULAR_COLORS.forEach((c) => {
        const lower = c.name.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            ...c,
            hex: resolveColorHex(c.name, c.nameAr, c.hex),
          });
        }
      });

      (customValuesByAttr[attr.id] || []).forEach((c) => {
        const lower = c.value.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            name: c.value,
            nameAr: c.valueAr,
            hex: c.hex || resolveColorHex(c.value),
          });
        }
      });

      return list;
    }

    if (isSize) {
      const list: string[] = [];
      const seen = new Set<string>();

      if (attr.values && attr.values.length > 0) {
        attr.values.forEach((v) => {
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

      (customValuesByAttr[attr.id] || []).forEach((c) => {
        if (!seen.has(c.value)) {
          seen.add(c.value);
          list.push(c.value);
        }
      });

      return list;
    }

    // Generic attribute
    const list: Array<{ name: string; nameAr?: string }> = [];
    const seen = new Set<string>();

    if (attr.values && attr.values.length > 0) {
      [...attr.values]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .forEach((v) => {
          if (!seen.has(v.value)) {
            seen.add(v.value);
            list.push({ name: v.value, nameAr: v.valueAr });
          }
        });
    }

    (customValuesByAttr[attr.id] || []).forEach((c) => {
      if (!seen.has(c.value)) {
        seen.add(c.value);
        list.push({ name: c.value, nameAr: c.valueAr });
      }
    });

    return list;
  };

  // Check if every included attribute has at least 1 value selected
  const hasZeroSelection = useMemo(() => {
    if (includedAttributes.length === 0) return true;
    return includedAttributes.some(
      (a) => (selectedValuesByAttr[a.id] || []).length === 0
    );
  }, [includedAttributes, selectedValuesByAttr]);

  // Calculate total variant count via Cartesian product
  const totalVariantsCount = useMemo(() => {
    if (hasZeroSelection) return 0;
    return includedAttributes.reduce((acc, a) => {
      const count = (selectedValuesByAttr[a.id] || []).length;
      return acc * (count || 1);
    }, 1);
  }, [includedAttributes, selectedValuesByAttr, hasZeroSelection]);

  // Helper string for the formula preview: e.g. "3 colors × 4 sizes × 2 materials = 24 variants"
  const formulaBreakdown = useMemo(() => {
    if (includedAttributes.length === 0) return '';
    return includedAttributes
      .map((attr) => {
        const count = (selectedValuesByAttr[attr.id] || []).length;
        const name = isArabic ? attr.nameAr || attr.name : attr.name;
        return `${count} ${name}`;
      })
      .join(' × ');
  }, [includedAttributes, selectedValuesByAttr, isArabic]);

  // Execute variant generation and confirm
  const handleConfirm = () => {
    if (hasZeroSelection || totalVariantsCount === 0) return;

    // Collect array of arrays for Cartesian product
    const comboArrays = includedAttributes.map(
      (attr) => selectedValuesByAttr[attr.id] || []
    );
    const combinations = cartesianProduct(comboArrays);

    const sizeAttr = includedAttributes.find(isSizeAttribute);
    const colorAttr = includedAttributes.find(isColorAttribute);

    const newCards: VarianceCardData[] = combinations.map((combo, index) => {
      const cardAttrs: Record<string, string> = {};
      includedAttributes.forEach((attr, attrIdx) => {
        cardAttrs[attr.id] = combo[attrIdx];
      });

      const sizeVal = sizeAttr
        ? cardAttrs[sizeAttr.id]
        : combo[0] || '';
      const colorVal = colorAttr
        ? cardAttrs[colorAttr.id]
        : combo[1] || '';

      const sku = generateRandomSku(combo);

      return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        size: sizeVal,
        color: colorVal,
        attributes: cardAttrs,
        stock: 1, // Quantity is 1
        basePrice: '0', // Price is 0
        comparePrice: '',
        sku,
      };
    });

    const selectedColors = colorAttr
      ? selectedValuesByAttr[colorAttr.id] || []
      : [];
    const selectedSizes = sizeAttr
      ? selectedValuesByAttr[sizeAttr.id] || []
      : [];

    onGenerate({
      cards: newCards,
      attributeIds: includedAttributes.map((a) => a.id),
      colors: selectedColors,
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
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50/90 via-indigo-50/30 to-gray-50/90">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-2xs">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>{t('addProduct.autoGenerateVariants', 'Auto Generate Variants')}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700">
                    {includedAttributes.length}{' '}
                    {isArabic ? 'خيارات' : 'options'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  {t(
                    'addProduct.autoGenerateSubtitle',
                    'Select values for your active options to instantly generate all variant combinations'
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
            {/* Attributes Selector / Inclusions Bar */}
            {unusedVendorAttributes.length > 0 && (
              <div className="flex items-center justify-between bg-gray-50/70 border border-gray-200/70 rounded-xl px-3.5 py-2">
                <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-gray-500" />
                  <span>
                    {isArabic
                      ? 'إضافة خيار إضافي إلى التوليد التلقائي:'
                      : 'Include additional option in generation:'}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {unusedVendorAttributes.map((ua) => (
                    <button
                      key={ua.id}
                      type="button"
                      onClick={() => handleAddAttribute(ua.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>{isArabic ? ua.nameAr || ua.name : ua.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Sections for each Included Attribute */}
            {includedAttributes.map((attr, attrIdx) => {
              const isColor = isColorAttribute(attr);
              const isSize = isSizeAttribute(attr);
              const selectedValues = selectedValuesByAttr[attr.id] || [];
              const titleName = isArabic ? attr.nameAr || attr.name : attr.name;
              const secondaryName = isArabic ? attr.name : attr.nameAr;
              const displayValues = getAttributeDisplayValues(attr);
              const allValueStrings = isColor
                ? (displayValues as { name: string }[]).map((c) => c.name)
                : isSize
                ? (displayValues as string[])
                : (displayValues as { name: string }[]).map((c) => c.name);

              return (
                <div
                  key={attr.id}
                  className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs space-y-3"
                >
                  {/* Attribute Section Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        {isColor ? (
                          <Palette size={15} />
                        ) : isSize ? (
                          <Layers size={15} />
                        ) : (
                          <Tag size={15} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">
                            {attrIdx + 1}. {titleName}
                          </span>
                          {secondaryName && (
                            <span className="text-[11px] text-gray-400 font-normal">
                              ({secondaryName})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {selectedValues.length} {isArabic ? 'محدد' : 'selected'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllForAttr(attr.id, allValueStrings)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        <CheckCheck size={13} />
                        <span>
                          {selectedValues.length === allValueStrings.length &&
                          allValueStrings.length > 0
                            ? t('addProduct.deselectAll', 'Deselect All')
                            : t('addProduct.selectAll', 'Select All')}
                        </span>
                      </button>

                      {includedAttributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attr.id)}
                          title={
                            isArabic
                              ? 'استبعاد هذا الخيار من التوليد'
                              : 'Exclude this option from generation'
                          }
                          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Value Selection Area */}
                  {isColor ? (
                    // Color Swatches Grid
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1.5 border border-gray-100 rounded-xl bg-gray-50/40 scrollbar-thin">
                        {(
                          displayValues as {
                            name: string;
                            nameAr?: string;
                            hex?: string;
                          }[]
                        ).map((c) => {
                          const isSelected = selectedValues.some(
                            (sc) => sc.toLowerCase() === c.name.toLowerCase()
                          );
                          const label =
                            isArabic && c.nameAr
                              ? `${c.nameAr} (${c.name})`
                              : c.name;

                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => toggleValue(attr.id, c.name)}
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
                              {isSelected && (
                                <Check
                                  size={12}
                                  className="shrink-0 text-white"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Color Adder */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={
                            isArabic
                              ? 'أضف لوناً مخصصاً (مثال: Olive, بورغندي)...'
                              : 'Add custom color (e.g. Olive, Burgundy)...'
                          }
                          value={customInputByAttr[attr.id] || ''}
                          onChange={(e) =>
                            setCustomInputByAttr((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomValue(attr);
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(attr)}
                          disabled={!(customInputByAttr[attr.id] || '').trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          <Plus size={13} />
                          <span>{isArabic ? 'إضافة' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  ) : isSize ? (
                    // Size Pills Flex Wrap
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 p-2 border border-gray-100 rounded-xl bg-gray-50/40 max-h-36 overflow-y-auto scrollbar-thin">
                        {(displayValues as string[]).map((size) => {
                          const isSelected = selectedValues.includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleValue(attr.id, size)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isSelected
                                  ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                              }`}
                            >
                              <span>{size}</span>
                              {isSelected && (
                                <Check size={12} className="text-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Size Adder */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={
                            isArabic
                              ? 'أضف مقاساً آخر (مثال: 5XL, 38)...'
                              : 'Add custom size (e.g. 5XL, 38)...'
                          }
                          value={customInputByAttr[attr.id] || ''}
                          onChange={(e) =>
                            setCustomInputByAttr((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomValue(attr);
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(attr)}
                          disabled={!(customInputByAttr[attr.id] || '').trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          <Plus size={13} />
                          <span>{isArabic ? 'إضافة' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Generic Attribute Pills
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 p-2 border border-gray-100 rounded-xl bg-gray-50/40 min-h-[50px] max-h-36 overflow-y-auto scrollbar-thin">
                        {(
                          displayValues as Array<{
                            name: string;
                            nameAr?: string;
                          }>
                        ).length > 0 ? (
                          (
                            displayValues as Array<{
                              name: string;
                              nameAr?: string;
                            }>
                          ).map((valObj) => {
                            const isSelected = selectedValues.some(
                              (sv) =>
                                sv.toLowerCase() === valObj.name.toLowerCase()
                            );
                            const label =
                              isArabic && valObj.nameAr
                                ? `${valObj.nameAr} (${valObj.name})`
                                : valObj.name;

                            return (
                              <button
                                key={valObj.name}
                                type="button"
                                onClick={() => toggleValue(attr.id, valObj.name)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                  isSelected
                                    ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                }`}
                              >
                                <span>{label}</span>
                                {isSelected && (
                                  <Check size={12} className="text-white" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="flex items-center text-gray-400 text-xs py-2 px-1">
                            <span>
                              {isArabic
                                ? 'لا توجد قيم مسبقة. أضف قيماً مخصصة أدناه.'
                                : 'No pre-set values in this attribute. Add custom values below.'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Custom Value Adder */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={
                            isArabic
                              ? `أضف قيمة مخصصة لـ ${titleName}...`
                              : `Add custom value for ${titleName}...`
                          }
                          value={customInputByAttr[attr.id] || ''}
                          onChange={(e) =>
                            setCustomInputByAttr((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomValue(attr);
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomValue(attr)}
                          disabled={!(customInputByAttr[attr.id] || '').trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          <Plus size={13} />
                          <span>{isArabic ? 'إضافة' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Warning if 0 values selected for this attribute */}
                  {selectedValues.length === 0 && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-[11px] pt-1 font-medium">
                      <AlertCircle size={13} />
                      <span>
                        {isArabic
                          ? `يرجى تحديد قيمة واحدة على الأقل لـ ${titleName}`
                          : `Please select at least 1 value for ${titleName}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Step: Generation Summary Breakdown */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-blue-50/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-indigo-950 font-semibold text-xs flex-wrap gap-2">
                <span>
                  {t('addProduct.generationPreview', 'Variants to be generated:')}
                </span>
                <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                  {formulaBreakdown ? `${formulaBreakdown} = ` : ''}
                  {totalVariantsCount}{' '}
                  {t('addProduct.variantsCount', 'variants')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-lg bg-white p-2.5 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.basePrice', 'Base Price')}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">
                    0.00 SAR
                  </div>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.stockQuantity', 'Stock')}
                  </div>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">
                    1 unit each
                  </div>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-gray-500 font-medium">
                    {t('addProduct.sku', 'SKU')}
                  </div>
                  <div className="font-bold text-indigo-600 text-xs mt-0.5 truncate font-mono">
                    Auto-generated
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
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4 bg-gray-50/80">
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
              disabled={hasZeroSelection || totalVariantsCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>
                {t('addProduct.generateButton', 'Auto Generate ({{count}})', {
                  count: totalVariantsCount,
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
