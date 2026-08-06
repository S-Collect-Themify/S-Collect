import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

interface CustomVarianceProp {
  name: string;
  items: string[];
}

interface VariantsPreviewCardProps {
  sizes?: string[];
  colors?: string[];
  customVariances?: CustomVarianceProp[];
  basePrice?: string;
  sku?: string;
  quantity?: number;
}

export default function VariantsPreviewCard({
  sizes = [],
  colors = [],
  customVariances = [],
  basePrice = '0',
  sku = '',
  quantity = 0,
}: VariantsPreviewCardProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const priceNum = parseFloat(basePrice) || 0;
  const totalStock = quantity || 0;

  // Generate combinations dynamically from sizes, colors, and custom variances
  const variantCombinations = useMemo(() => {
    const validSizes = sizes.filter((s) => s.trim().length > 0);
    const validColors = colors.filter((c) => c.trim().length > 0);
    const validCustoms = customVariances
      .map((cv) => ({
        name: cv.name,
        items: cv.items.filter((i) => i.trim().length > 0),
      }))
      .filter((cv) => cv.items.length > 0);

    if (
      validSizes.length === 0 &&
      validColors.length === 0 &&
      validCustoms.length === 0
    ) {
      return [];
    }

    const sizeList = validSizes.length > 0 ? validSizes : [undefined];
    const colorList = validColors.length > 0 ? validColors : [undefined];

    let combinations: {
      size?: string;
      color?: string;
      customAttrs?: Record<string, string>;
      variantSku: string;
      stock: number;
    }[] = [];

    // Cartesian product
    sizeList.forEach((s) => {
      colorList.forEach((c) => {
        combinations.push({
          size: s,
          color: c,
          customAttrs: {},
          variantSku: '',
          stock: 0,
        });
      });
    });

    // Expand with custom variances
    validCustoms.forEach((cv) => {
      const expanded: typeof combinations = [];
      combinations.forEach((combo) => {
        cv.items.forEach((itemVal) => {
          expanded.push({
            ...combo,
            customAttrs: { ...combo.customAttrs, [cv.name]: itemVal },
          });
        });
      });
      combinations = expanded;
    });

    const count = combinations.length;
    const stockPerVariant = count > 0 ? Math.round(totalStock / count) : 0;

    return combinations.map((combo) => {
      const skuParts = [sku || 'SKU'];
      if (combo.size) skuParts.push(combo.size);
      if (combo.color) skuParts.push(combo.color);
      if (combo.customAttrs) {
        Object.values(combo.customAttrs).forEach((val) => skuParts.push(val));
      }

      return {
        ...combo,
        variantSku: skuParts.join('-'),
        stock: stockPerVariant,
      };
    });
  }, [sizes, colors, customVariances, sku, totalStock]);

  if (variantCombinations.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-gray-700" />
          <h4 className="text-sm font-bold text-gray-900">
            {isArabic ? 'الأنواع والمتغيرات' : 'Generated Product Variants'}
          </h4>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
          {variantCombinations.length}{' '}
          {isArabic ? 'متغير' : variantCombinations.length === 1 ? 'variant' : 'variants'}
        </span>
      </div>

      {/* Scrollable table container if variants increase */}
      <div className="max-h-72 overflow-y-auto overflow-x-auto rounded-xl border border-gray-100 scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs rtl:text-right">
          <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 font-semibold text-gray-500">
            <tr>
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">{isArabic ? 'رمز المنتج (SKU)' : 'SKU'}</th>
              {sizes.length > 0 && (
                <th className="px-4 py-2.5">{isArabic ? 'المقاس' : 'Size'}</th>
              )}
              {colors.length > 0 && (
                <th className="px-4 py-2.5">{isArabic ? 'اللون' : 'Color'}</th>
              )}
              {customVariances.map((cv) => (
                <th key={cv.name} className="px-4 py-2.5">
                  {cv.name}
                </th>
              ))}
              <th className="px-4 py-2.5">{isArabic ? 'السعر' : 'Price'}</th>
              <th className="px-4 py-2.5">{isArabic ? 'المخزون' : 'Stock'}</th>
              <th className="px-4 py-2.5">{isArabic ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {variantCombinations.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                <td className="px-4 py-2.5 font-mono font-medium text-gray-800">
                  {item.variantSku}
                </td>
                {sizes.length > 0 && (
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                      {item.size || '-'}
                    </span>
                  </td>
                )}
                {colors.length > 0 && (
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                      {item.color || '-'}
                    </span>
                  </td>
                )}
                {customVariances.map((cv) => (
                  <td key={cv.name} className="px-4 py-2.5 text-gray-700">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800">
                      {item.customAttrs?.[cv.name] || '-'}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-2.5 font-semibold text-gray-900">
                  {priceNum.toLocaleString()} SAR
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-700">
                  {item.stock} {isArabic ? 'وحدة' : 'units'}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    {isArabic ? 'نشط' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
