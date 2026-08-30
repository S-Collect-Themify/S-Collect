import ExcelJS from 'exceljs';
import type { Category } from '../services/products';

export const DEFAULT_FALLBACK_CATEGORIES: Array<{
  name: string;
  nameAr: string;
  id: string;
}> = [
  {
    id: 'cat-bags-accessories',
    name: 'Bags & Accessories',
    nameAr: 'حقائب وإكسسوارات',
  },
  {
    id: 'cat-clothing-apparel',
    name: 'Clothing & Apparel',
    nameAr: 'ملابس وأزياء',
  },
  {
    id: 'cat-footwear-shoes',
    name: 'Footwear & Shoes',
    nameAr: 'أحذية ومستلزماتها',
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    nameAr: 'إلكترونيات وأجهزة',
  },
  {
    id: 'cat-beauty-personal-care',
    name: 'Beauty & Personal Care',
    nameAr: 'عناية وتجميل',
  },
  {
    id: 'cat-home-kitchen',
    name: 'Home & Kitchen',
    nameAr: 'المنزل والمطبخ',
  },
  {
    id: 'cat-watches-jewelry',
    name: 'Watches & Jewelry',
    nameAr: 'ساعات ومجوهرات',
  },
  {
    id: 'cat-sports-fitness',
    name: 'Sports & Fitness',
    nameAr: 'رياضة ولياقة',
  },
  {
    id: 'cat-perfumes',
    name: 'Perfumes & Fragrances',
    nameAr: 'عطور وبخور',
  },
];

/**
 * Generate a clean Excel (.xlsx) template table for product bulk import:
 * - Products sheet: Clean ready-to-fill table with headers, sample rows & category dropdown
 * - Categories sheet: Reference list of store categories (copy category ids from here)
 * - Instructions sheet: Import rules, column specs, field constraints & example
 */
export async function generateProductImportTemplate(
  categories: Category[] = []
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'S-Collect Platform';
  workbook.created = new Date();
  workbook.modified = new Date();

  const activeCategories =
    categories.length > 0
      ? categories.filter((c) => c.isActive !== false)
      : DEFAULT_FALLBACK_CATEGORIES;

  // ----------------------------------------------------
  // SHEET 1: Products (ورقة المنتجات - الجدول المباشر)
  // ----------------------------------------------------
  const productsSheet = workbook.addWorksheet('Products', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: '047857' } },
  });

  const columnsDef = [
    { key: 'name', header: 'name', width: 22, required: true, type: 'req' },
    {
      key: 'nameAr',
      header: 'nameAr',
      width: 22,
      required: true,
      type: 'req',
    },
    {
      key: 'category',
      header: 'category',
      width: 24,
      required: true,
      type: 'req',
    },
    {
      key: 'option1Name',
      header: 'option1Name',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option1NameAr',
      header: 'option1NameAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option1Value',
      header: 'option1Value',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option1ValueAr',
      header: 'option1ValueAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option2Name',
      header: 'option2Name',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option2NameAr',
      header: 'option2NameAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option2Value',
      header: 'option2Value',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option2ValueAr',
      header: 'option2ValueAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option3Name',
      header: 'option3Name',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option3NameAr',
      header: 'option3NameAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option3Value',
      header: 'option3Value',
      width: 16,
      required: false,
      type: 'optVar',
    },
    {
      key: 'option3ValueAr',
      header: 'option3ValueAr',
      width: 16,
      required: false,
      type: 'optVar',
    },
    { key: 'sku', header: 'sku', width: 16, required: true, type: 'req' },
    { key: 'price', header: 'price', width: 14, required: true, type: 'req' },
    { key: 'stock', header: 'stock', width: 12, required: true, type: 'req' },
    {
      key: 'compareAtPrice',
      header: 'compareAtPrice',
      width: 16,
      required: false,
      type: 'opt',
    },
    {
      key: 'description',
      header: 'description',
      width: 28,
      required: false,
      type: 'opt',
    },
    {
      key: 'descriptionAr',
      header: 'descriptionAr',
      width: 28,
      required: false,
      type: 'opt',
    },
    {
      key: 'imageUrl',
      header: 'imageUrl',
      width: 36,
      required: false,
      type: 'opt',
    },
  ];

  productsSheet.columns = columnsDef.map((col) => ({
    key: col.key,
    header: col.header,
    width: col.width,
  }));

  // Style Header Row (Row 1)
  const headerRow = productsSheet.getRow(1);
  headerRow.height = 28;

  columnsDef.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;

    let bgColor = '1E293B'; // Dark slate
    if (col.type === 'req') {
      bgColor = '047857'; // Deep Emerald for REQUIRED
    } else if (col.type === 'optVar') {
      bgColor = '0F766E'; // Teal for Options
    } else {
      bgColor = '334155'; // Slate for Optional
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bgColor },
    };
    cell.font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    cell.border = {
      top: { style: 'medium', color: { argb: '0F172A' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } },
      left: { style: 'thin', color: { argb: '475569' } },
      right: { style: 'thin', color: { argb: '475569' } },
    };
  });

  // Sample Rows matching the instructions:
  // Row 2: Leather Bag (Black)
  // Row 3: Leather Bag (Brown) -> grouped as 1 product with 2 variants
  const sampleCategoryName =
    activeCategories.find((c) => c.name.toLowerCase().includes('bag'))?.name ||
    activeCategories[0]?.name ||
    'Bags & Accessories';

  const sampleRows = [
    {
      name: 'Leather Bag',
      nameAr: 'حقيبة جلد',
      category: sampleCategoryName,
      option1Name: 'Color',
      option1NameAr: 'اللون',
      option1Value: 'Black',
      option1ValueAr: 'أسود',
      option2Name: '',
      option2NameAr: '',
      option2Value: '',
      option2ValueAr: '',
      option3Name: '',
      option3NameAr: '',
      option3Value: '',
      option3ValueAr: '',
      sku: 'BAG-BLK',
      price: 199,
      stock: 10,
      compareAtPrice: 249,
      description: 'Handcrafted genuine leather handbag.',
      descriptionAr: 'حقيبة كتف مصنوعة يدوياً من الجلد الطبيعي.',
      imageUrl:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    },
    {
      name: 'Leather Bag',
      nameAr: 'حقيبة جلد',
      category: sampleCategoryName,
      option1Name: 'Color',
      option1NameAr: 'اللون',
      option1Value: 'Brown',
      option1ValueAr: 'بني',
      option2Name: '',
      option2NameAr: '',
      option2Value: '',
      option2ValueAr: '',
      option3Name: '',
      option3NameAr: '',
      option3Value: '',
      option3ValueAr: '',
      sku: 'BAG-BRN',
      price: 199,
      stock: 8,
      compareAtPrice: 249,
      description: 'Handcrafted genuine leather handbag.',
      descriptionAr: 'حقيبة كتف مصنوعة يدوياً من الجلد الطبيعي.',
      imageUrl: '',
    },
  ];

  sampleRows.forEach((rowValues) => {
    const row = productsSheet.addRow(rowValues);
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: '1F2937' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
      // Format number cells
      // price (col 17), stock (col 18), compareAtPrice (col 19)
      if (colNumber === 17 || colNumber === 19) {
        cell.numFmt = '#,##0.00';
      } else if (colNumber === 18) {
        cell.numFmt = '#,##0';
      }
    });
  });

  // Dropdown Validation on Category Column (Column 3 / C) using range without instantiating empty row objects
  const maxCatRow = Math.max(activeCategories.length + 1, 10);
  (productsSheet as any).dataValidations.add('C2:C500', {
    type: 'list',
    allowBlank: true,
    formulae: [`=Categories!$A$2:$A$${maxCatRow}`],
    showErrorMessage: true,
    errorTitle: 'Invalid Category',
    error:
      'Please select a category from the dropdown or use the exact name from the Categories sheet.',
  });

  // ----------------------------------------------------
  // SHEET 2: Categories (ورقة الفئات المعتمدة)
  // ----------------------------------------------------
  const categoriesSheet = workbook.addWorksheet('Categories', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: '3B82F6' } },
  });

  categoriesSheet.columns = [
    { key: 'categoryName', header: 'Category Name (English)', width: 28 },
    { key: 'categoryNameAr', header: 'Category Name (Arabic)', width: 28 },
    { key: 'categoryId', header: 'Category ID', width: 32 },
  ];

  const catHeaderRow = categoriesSheet.getRow(1);
  catHeaderRow.height = 28;
  [1, 2, 3].forEach((colIdx) => {
    const cell = catHeaderRow.getCell(colIdx);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' },
    };
    cell.font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });

  activeCategories.forEach((cat) => {
    const r = categoriesSheet.addRow({
      categoryName: cat.name,
      categoryNameAr: cat.nameAr,
      categoryId: cat.id,
    });
    r.height = 22;
    r.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: '1F2937' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    });
  });

  // ----------------------------------------------------
  // SHEET 3: Instructions (ورقة الإرشادات)
  // ----------------------------------------------------
  const instructionsSheet = workbook.addWorksheet('Instructions', {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: 'F59E0B' } },
  });

  instructionsSheet.getColumn(1).width = 95;

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: '0F172A' },
  };
  const headingFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: '047857' },
  };
  const bodyFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    color: { argb: '334155' },
  };
  const boldBodyFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: '1E293B' },
  };
  const exampleFont: Partial<ExcelJS.Font> = {
    name: 'Consolas',
    size: 9,
    color: { argb: '475569' },
  };

  const instructionLines: Array<{
    text: string;
    font: Partial<ExcelJS.Font>;
    height?: number;
  }> = [
    {
      text: 'Product Bulk Import — Instructions',
      font: titleFont,
      height: 30,
    },
    { text: '', font: bodyFont, height: 8 },

    // Grouping rules
    {
      text: '━━  Variants & Product Grouping Rules',
      font: headingFont,
      height: 22,
    },
    {
      text: '1. Fill the "Products" sheet — one row per VARIANT (size, color, etc.).',
      font: bodyFont,
    },
    {
      text: '2. Products with multiple variants: repeat the same name / nameAr / category on each variant row.',
      font: bodyFont,
    },
    {
      text: '3. Consecutive rows with the same name + nameAr + category are grouped as ONE product.',
      font: bodyFont,
    },
    {
      text: '4. Simple products (no options): leave Option columns blank — one row = one product.',
      font: bodyFont,
    },
    { text: '', font: bodyFont, height: 8 },

    // Columns
    {
      text: '━━  Required & Optional Columns',
      font: headingFont,
      height: 22,
    },
    {
      text: 'REQUIRED columns:  name, nameAr, category, sku, price, stock.',
      font: boldBodyFont,
    },
    {
      text: 'OPTIONAL columns:  description, descriptionAr, compareAtPrice, Option columns (option1Name, option1Value...), imageUrl.',
      font: bodyFont,
    },
    { text: '', font: bodyFont, height: 8 },

    // Field constraints
    {
      text: '━━  Field Constraints & Formatting',
      font: headingFont,
      height: 22,
    },
    {
      text: 'category:          Select from the dropdown (category name). If typing manually, use the exact name from the "Categories" sheet.',
      font: bodyFont,
    },
    {
      text: 'price / compareAtPrice: in SAR (e.g. 99.50).',
      font: bodyFont,
    },
    {
      text: 'stock:             whole number (e.g. 20).',
      font: bodyFont,
    },
    {
      text: 'sku:               must be unique across the platform.',
      font: bodyFont,
    },
    { text: '', font: bodyFont, height: 8 },

    // Images
    {
      text: '━━  Product Images — Two Ways (embedded takes priority over URL)',
      font: headingFont,
      height: 22,
    },
    {
      text: '  • Embed directly: in Excel, click Insert → Picture → This Device, resize and position it over any cell in the product row.',
      font: bodyFont,
    },
    {
      text: '  • imageUrl column: paste a public image URL (JPEG/PNG/WebP). Only the first row URL is used per product.',
      font: bodyFont,
    },
    {
      text: '  If no image is provided the product is still created — you can upload images later.',
      font: {
        ...bodyFont,
        italic: true,
        color: { argb: '64748B' },
      },
    },
    { text: '', font: bodyFont, height: 8 },

    // Example
    {
      text: '━━  Example — product with Color option (2 rows)',
      font: headingFont,
      height: 22,
    },
    {
      text: '  name=Leather Bag | nameAr=حقيبة جلد | category=Bags & Accessories | option1Name=Color | option1NameAr=اللون | option1Value=Black | option1ValueAr=أسود | sku=BAG-BLK | price=199 | stock=10',
      font: exampleFont,
    },
    {
      text: '  name=Leather Bag | nameAr=حقيبة جلد | category=Bags & Accessories | option1Name=Color | option1NameAr=اللون | option1Value=Brown | option1ValueAr=بني  | sku=BAG-BRN | price=199 | stock=5',
      font: exampleFont,
    },
  ];

  instructionLines.forEach((line) => {
    const row = instructionsSheet.addRow([line.text]);
    row.height = line.height || 18;
    const cell = row.getCell(1);
    cell.font = line.font;
    cell.alignment = { vertical: 'middle', wrapText: true };
  });

  // Generate ArrayBuffer and create Blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return blob;
}

