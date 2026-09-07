import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Plus, ArrowUpDown, Tag } from 'lucide-react';
import type { VendorAttribute, VendorAttributeValue } from '../types';

interface AttributeCardProps {
  attribute: VendorAttribute;
  onEditAttribute: (attribute: VendorAttribute) => void;
  onDeleteAttribute: (attribute: VendorAttribute) => void;
  onAddValue: (attribute: VendorAttribute) => void;
  onEditValue: (attribute: VendorAttribute, value: VendorAttributeValue) => void;
  onDeleteValue: (attribute: VendorAttribute, value: VendorAttributeValue) => void;
}

export const AttributeCard = ({
  attribute,
  onEditAttribute,
  onDeleteAttribute,
  onAddValue,
  onEditValue,
  onDeleteValue,
}: AttributeCardProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const primaryName = isArabic ? attribute.nameAr || attribute.name : attribute.name;
  const secondaryName = isArabic ? attribute.name : attribute.nameAr;

  // Sort values by sortOrder asc
  const sortedValues = [...(attribute.values || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Card Header */}
      <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Tag size={16} />
              </span>
              <h3 className="text-base font-bold text-gray-900 truncate" title={primaryName}>
                {primaryName}
              </h3>
              {attribute.sortOrder !== undefined && attribute.sortOrder !== null && (
                <span
                  className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0"
                  title={t('attributes.card.sortOrder', 'Sort order')}
                >
                  <ArrowUpDown size={11} />
                  {attribute.sortOrder}
                </span>
              )}
            </div>

            {secondaryName && secondaryName !== primaryName && (
              <p className="text-xs font-medium text-gray-500 mt-1 truncate" dir={isArabic ? 'ltr' : 'rtl'}>
                {secondaryName}
              </p>
            )}
          </div>

          {/* Card Actions: Edit & Delete Attribute */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEditAttribute(attribute)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title={t('attributes.card.editAttribute', 'Edit attribute')}
              aria-label={t('attributes.card.editAttribute', 'Edit attribute')}
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteAttribute(attribute)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title={t('attributes.card.deleteAttribute', 'Delete attribute')}
              aria-label={t('attributes.card.deleteAttribute', 'Delete attribute')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Values Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('attributes.card.valuesCount', 'Values ({{count}})', {
                count: sortedValues.length,
              })}
            </span>
            <button
              type="button"
              onClick={() => onAddValue(attribute)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Plus size={14} />
              {t('attributes.card.addValue', 'Add Value')}
            </button>
          </div>

          {sortedValues.length === 0 ? (
            <div className="py-6 px-4 rounded-xl border border-dashed border-gray-200 text-center bg-gray-50/50">
              <p className="text-xs text-gray-400">
                {t('attributes.card.noValues', 'No values yet. Click "Add Value" to define options.')}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              {sortedValues.map((val) => {
                const primaryVal = isArabic ? val.valueAr || val.value : val.value;
                const secondaryVal = isArabic ? val.value : val.valueAr;

                return (
                  <div
                    key={val.id}
                    className="group/val inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100/90 text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200/70 transition-all shadow-2xs"
                  >
                    <span className="font-semibold text-gray-900">{primaryVal}</span>
                    {secondaryVal && secondaryVal !== primaryVal && (
                      <span className="text-[11px] text-gray-400 font-normal">
                        ({secondaryVal})
                      </span>
                    )}

                    {/* Value quick actions */}
                    <div className="flex items-center gap-0.5 ml-1 border-l border-gray-200 pl-1 rtl:ml-0 rtl:mr-1 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-1">
                      <button
                        type="button"
                        onClick={() => onEditValue(attribute, val)}
                        className="p-0.5 text-gray-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title={t('attributes.card.editValue', 'Edit value')}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteValue(attribute, val)}
                        className="p-0.5 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        title={t('attributes.card.deleteValue', 'Delete value')}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
