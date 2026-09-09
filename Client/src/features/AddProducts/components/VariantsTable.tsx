import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Copy, AlertCircle, Sparkles } from 'lucide-react';
import type { VarianceCardData } from '../types';
import type { VendorAttribute } from '../../attributes/types';
import { ModernSelect } from '../../../components/ui/ModernSelect';

interface VariantsTableProps {
  varianceCards: VarianceCardData[];
  activeAttributes?: VendorAttribute[];
  activeOption1Attr?: VendorAttribute | null;
  activeOption2Attr?: VendorAttribute | null;
  availableOption1Values?: { label: string; value: string }[];
  availableOption2Values?: { label: string; value: string }[];
  onUpdateCardField: (
    cardId: string,
    field: keyof VarianceCardData,
    val: any
  ) => void;
  onUpdateCardAttribute?: (
    cardId: string,
    attributeId: string,
    val: string
  ) => void;
  onAddVariance: () => void;
  onAutoGenerateVariants?: () => void;
  onRemoveVariance: (cardId: string) => void;
  onDuplicateVariance?: (card: VarianceCardData) => void;
  isArabic?: boolean;
}

export const VariantsTable = ({
  varianceCards,
  activeAttributes,
  activeOption1Attr,
  activeOption2Attr,
  availableOption1Values,
  availableOption2Values,
  onUpdateCardField,
  onUpdateCardAttribute,
  onAddVariance,
  onAutoGenerateVariants,
  onRemoveVariance,
  onDuplicateVariance,
  isArabic = false,
}: VariantsTableProps) => {
  const { t } = useTranslation();

  const resolvedAttributes = useMemo(() => {
    if (activeAttributes && activeAttributes.length > 0) {
      return activeAttributes;
    }
    const list: VendorAttribute[] = [];
    if (activeOption1Attr) list.push(activeOption1Attr);
    if (activeOption2Attr) list.push(activeOption2Attr);
    return list;
  }, [activeAttributes, activeOption1Attr, activeOption2Attr]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-start text-xs">
          <thead>
            <tr className="border-b border-gray-200/80 bg-gray-50/80 text-gray-600 font-semibold select-none">
              <th className="py-3 px-3 w-10 text-center text-[11px] text-gray-400 font-mono">
                #
              </th>

              {/* Dynamic Columns for each Active Attribute */}
              {resolvedAttributes.length > 0 ? (
                resolvedAttributes.map((attr, attrIdx) => {
                  const headerName = isArabic
                    ? attr.nameAr || attr.name
                    : attr.name;
                  const secondaryLang = isArabic ? attr.name : attr.nameAr;

                  return (
                    <th
                      key={attr.id || attrIdx}
                      className="py-3 px-3 min-w-[140px] text-start"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800">
                          {headerName}
                        </span>
                        <span className="text-red-500">*</span>
                        {secondaryLang && (
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({secondaryLang})
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })
              ) : (
                <th className="py-3 px-3 min-w-[140px] text-start">
                  <span className="font-semibold text-gray-800">
                    {t('addProduct.size', 'Size')}
                  </span>
                  <span className="text-red-500">*</span>
                </th>
              )}

              {/* Base Price Column */}
              <th className="py-3 px-3 min-w-[120px] text-start">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-800">
                    {t('addProduct.basePrice', 'Base Price')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">(SAR)</span>
                  <span className="text-red-500">*</span>
                </div>
              </th>

              {/* Compare Price Column */}
              <th className="py-3 px-3 min-w-[120px] text-start">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-800">
                    {t('addProduct.comparePrice', 'Compare-at')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">(SAR)</span>
                </div>
              </th>

              {/* Stock Quantity Column */}
              <th className="py-3 px-3 min-w-[130px] text-start">
                <span className="font-semibold text-gray-800">
                  {t('addProduct.stockQuantity', 'Stock')}
                </span>
              </th>

              {/* SKU Column */}
              <th className="py-3 px-3 min-w-[130px] text-start">
                <span className="font-semibold text-gray-800">
                  {t('addProduct.sku', 'SKU')}
                </span>
              </th>

              {/* Actions Column */}
              <th className="py-3 px-3 w-16 text-center">
                <span className="sr-only">{t('addProduct.actions', 'Actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {varianceCards.map((card, cardIdx) => {
              const baseNum = parseFloat(card.basePrice);
              const compareNum = parseFloat(card.comparePrice);
              const hasCompareError = Boolean(
                card.comparePrice &&
                  card.comparePrice.trim() !== '' &&
                  !isNaN(compareNum) &&
                  !isNaN(baseNum) &&
                  compareNum > 0 &&
                  compareNum <= baseNum
              );

              return (
                <tr
                  key={card.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Row index */}
                  <td className="py-2.5 px-3 text-center text-gray-400 font-mono text-xs">
                    {cardIdx + 1}
                  </td>

                  {/* Dynamic Option Inputs for each Active Attribute */}
                  {resolvedAttributes.length > 0 ? (
                    resolvedAttributes.map((attr, attrIdx) => {
                      let val = '';
                      if (attrIdx === 0) {
                        val = card.attributes?.[attr.id] || card.size || '';
                      } else if (attrIdx === 1) {
                        val = card.attributes?.[attr.id] || card.color || '';
                      } else {
                        val = card.attributes?.[attr.id] || '';
                      }

                      const options = (attr.values || [])
                        .sort(
                          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                        )
                        .map((v) => ({
                          label:
                            isArabic && v.valueAr
                              ? `${v.valueAr} (${v.value})`
                              : v.value,
                          value: v.value,
                        }));

                      const placeholder =
                        options[0]?.value ||
                        (isArabic ? 'اختر أو اكتب...' : 'Select or type...');

                      return (
                        <td key={attr.id || attrIdx} className="py-2 px-3">
                          <ModernSelect
                            value={val}
                            onChange={(newVal) => {
                              if (attrIdx === 0) {
                                onUpdateCardField(card.id, 'size', newVal);
                              } else if (attrIdx === 1) {
                                onUpdateCardField(card.id, 'color', newVal);
                              }
                              onUpdateCardAttribute?.(card.id, attr.id, newVal);
                            }}
                            options={options}
                            placeholder={placeholder}
                            minWidth={130}
                            maxHeight={220}
                            isSearchable={true}
                            creatable={true}
                          />
                        </td>
                      );
                    })
                  ) : (
                    <td className="py-2 px-3">
                      <ModernSelect
                        value={card.size}
                        onChange={(val) =>
                          onUpdateCardField(card.id, 'size', val)
                        }
                        options={availableOption1Values || []}
                        placeholder={t('addProduct.selectSize', 'Select')}
                        minWidth={130}
                        maxHeight={220}
                        isSearchable={true}
                        creatable={true}
                      />
                    </td>
                  )}

                  {/* Base Price */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={card.basePrice}
                      onChange={(e) =>
                        onUpdateCardField(card.id, 'basePrice', e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-gray-900 focus:outline-none text-end rtl:text-start"
                    />
                  </td>

                  {/* Compare Price */}
                  <td className="py-2.5 px-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={card.comparePrice}
                        onChange={(e) =>
                          onUpdateCardField(
                            card.id,
                            'comparePrice',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none text-end rtl:text-start ${
                          hasCompareError
                            ? 'border-red-500 focus:border-red-500 text-red-600 pr-7 rtl:pr-2.5 rtl:pl-7'
                            : 'border-gray-200 focus:border-gray-900'
                        }`}
                      />
                      {hasCompareError && (
                        <div
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-red-500 rtl:right-auto rtl:left-2"
                          title={t(
                            'addProduct.errors.comparePriceMustBeGreater',
                            'Compare-at price must be greater than base price'
                          )}
                        >
                          <AlertCircle size={13} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock Quantity Stepper */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCardField(
                            card.id,
                            'stock',
                            Math.max(0, (card.stock || 0) - 1)
                          )
                        }
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition active:scale-95 cursor-pointer bg-white"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={card.stock}
                        onChange={(e) =>
                          onUpdateCardField(
                            card.id,
                            'stock',
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        className="w-14 rounded-md border border-gray-200 bg-white py-1 px-1 text-center text-xs font-semibold focus:border-gray-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCardField(
                            card.id,
                            'stock',
                            (card.stock || 0) + 1
                          )
                        }
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition active:scale-95 cursor-pointer bg-white"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={card.sku}
                      onChange={(e) =>
                        onUpdateCardField(card.id, 'sku', e.target.value)
                      }
                      placeholder="SKU-001"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-mono text-gray-800 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
                    />
                  </td>

                  {/* Actions (Duplicate & Delete) */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onDuplicateVariance && (
                        <button
                          type="button"
                          onClick={() => onDuplicateVariance(card)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                          title={t(
                            'addProduct.duplicateVariance',
                            'Duplicate variant'
                          )}
                        >
                          <Copy size={13} />
                        </button>
                      )}
                      {varianceCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveVariance(card.id)}
                          className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title={t(
                            'addProduct.removeVarianceCard',
                            'Remove variant'
                          )}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Add Variant CTA & Auto Generate */}
      <div className="border-t border-gray-200/80 bg-gray-50/50 p-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onAddVariance}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Plus size={14} />
            {t('addProduct.addVariance', 'Add Variance')}
          </button>

          {onAutoGenerateVariants && (
            <button
              type="button"
              onClick={onAutoGenerateVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition cursor-pointer"
            >
              <Sparkles size={14} className="text-indigo-600" />
              {t('addProduct.autoGenerateVariants', 'Auto Generate Variants')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
