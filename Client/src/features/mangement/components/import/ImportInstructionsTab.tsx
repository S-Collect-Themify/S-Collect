import { useTranslation } from 'react-i18next';
import {
  Layers,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';

export default function ImportInstructionsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 text-xs leading-relaxed text-gray-700">
      {/* 1. Grouping & Variants Rule */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <Layers size={16} className="text-emerald-600" />
          <span>
            {t(
              'managementTable.importModal.ruleGroupingTitle',
              'Variants & Product Grouping Rules'
            )}
          </span>
        </div>
        <p className="text-gray-600">
          {t(
            'managementTable.importModal.ruleGroupingDesc',
            'Fill the "Products" sheet — one row per VARIANT (size, color, etc.). Products with multiple variants: repeat the same name / nameAr / category on each variant row. Consecutive rows with the same name + nameAr + category are grouped as ONE product.'
          )}
        </p>
        <p className="text-gray-600 pt-1 border-t border-gray-200/60">
          <strong className="text-gray-800">
            {t(
              'managementTable.importModal.ruleSimpleTitle',
              'Simple products (no options)'
            )}
            :{' '}
          </strong>
          {t(
            'managementTable.importModal.ruleSimpleDesc',
            'Leave Option columns blank — one row = one product.'
          )}
        </p>
      </div>

      {/* 2. Columns Breakdown */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-emerald-600" />
          <span>
            {t(
              'managementTable.importModal.ruleColumnsTitle',
              'Required & Optional Columns'
            )}
          </span>
        </h4>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
              REQUIRED
            </span>
            <p className="text-gray-800 font-medium">
              name, nameAr, category, sku, price, stock
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
              OPTIONAL
            </span>
            <p className="text-gray-600">
              description, descriptionAr, compareAtPrice, Option columns
              (option1Name, option1Value...), imageUrl
            </p>
          </div>
        </div>
      </div>

      {/* 3. Field Constraints & Rules */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
        <h4 className="font-bold text-gray-900 text-sm">
          {t(
            'managementTable.importModal.ruleFieldRulesTitle',
            'Field Constraints & Formatting'
          )}
        </h4>
        <ul className="space-y-1 text-gray-600 list-disc list-inside">
          <li>
            {t(
              'managementTable.importModal.ruleCategory',
              'category: Select from the dropdown (category name) or use the exact name from the "Categories" sheet.'
            )}
          </li>
          <li>
            {t(
              'managementTable.importModal.rulePrice',
              'price / compareAtPrice: in SAR (e.g. 99.50).'
            )}
          </li>
          <li>
            {t(
              'managementTable.importModal.ruleStock',
              'stock: whole number (e.g. 20).'
            )}
          </li>
          <li>
            {t(
              'managementTable.importModal.ruleSku',
              'sku: must be unique across the platform.'
            )}
          </li>
        </ul>
      </div>

      {/* 4. Product Images Guide */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
        <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
          <ImageIcon size={16} className="text-emerald-700" />
          <span>
            {t(
              'managementTable.importModal.ruleImagesTitle',
              'Product Images (Two Ways — Embedded takes priority over URL)'
            )}
          </span>
        </h4>
        <ul className="space-y-1.5 text-emerald-900 text-xs">
          <li className="flex items-start gap-2">
            <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Embed directly:</strong>{' '}
              {t(
                'managementTable.importModal.ruleImageEmbed',
                'In Excel, click Insert → Picture → This Device, resize and position it over any cell in the product row.'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>imageUrl column:</strong>{' '}
              {t(
                'managementTable.importModal.ruleImageUrl',
                'Paste a public image URL (JPEG/PNG/WebP). Only the first row URL is used per product.'
              )}
            </span>
          </li>
          <li className="text-emerald-700 text-[11px] pt-1">
            <em>
              {t(
                'managementTable.importModal.ruleImageNote',
                'If no image is provided the product is still created — you can upload images later.'
              )}
            </em>
          </li>
        </ul>
      </div>

      {/* 5. Example Table Card */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-600" />
          <h4 className="font-bold text-gray-900 text-sm">
            {t(
              'managementTable.importModal.exampleTitle',
              'Example — product with Color option (2 rows)'
            )}
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse bg-white rounded-xl overflow-hidden shadow-2xs border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-start font-semibold">
                <th className="p-2 border-b border-gray-200">name</th>
                <th className="p-2 border-b border-gray-200">nameAr</th>
                <th className="p-2 border-b border-gray-200">category</th>
                <th className="p-2 border-b border-gray-200">option1Name</th>
                <th className="p-2 border-b border-gray-200">option1NameAr</th>
                <th className="p-2 border-b border-gray-200">option1Value</th>
                <th className="p-2 border-b border-gray-200">option1ValueAr</th>
                <th className="p-2 border-b border-gray-200">sku</th>
                <th className="p-2 border-b border-gray-200">price</th>
                <th className="p-2 border-b border-gray-200">stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              <tr className="hover:bg-gray-50">
                <td className="p-2 font-medium text-gray-900">Leather Bag</td>
                <td className="p-2">حقيبة جلد</td>
                <td className="p-2">Bags & Accessories</td>
                <td className="p-2">Color</td>
                <td className="p-2">اللون</td>
                <td className="p-2 font-bold text-emerald-700">Black</td>
                <td className="p-2 font-bold text-emerald-700">أسود</td>
                <td className="p-2 font-mono">BAG-BLK</td>
                <td className="p-2">199</td>
                <td className="p-2">10</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-2 font-medium text-gray-900">Leather Bag</td>
                <td className="p-2">حقيبة جلد</td>
                <td className="p-2">Bags & Accessories</td>
                <td className="p-2">Color</td>
                <td className="p-2">اللون</td>
                <td className="p-2 font-bold text-amber-700">Brown</td>
                <td className="p-2 font-bold text-amber-700">بني</td>
                <td className="p-2 font-mono">BAG-BRN</td>
                <td className="p-2">199</td>
                <td className="p-2">8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
