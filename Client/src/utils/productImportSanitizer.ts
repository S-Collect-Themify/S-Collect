import ExcelJS from 'exceljs';

/**
 * Sanitizes an Excel import file before sending it to the backend:
 * 1. Removes empty rows / phantom rows that contain no meaningful data
 * 2. Trims leading and trailing whitespace from string cells (like SKU, names)
 * 3. Returns a clean File object ready for upload to prevent duplicate empty SKU errors
 */
export async function sanitizeProductImportFile(file: File): Promise<File> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const productsSheet =
      workbook.getWorksheet('Products') ||
      workbook.getWorksheet('products') ||
      workbook.worksheets[0];

    if (!productsSheet) {
      return file;
    }

    const rowsToDelete: number[] = [];

    productsSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      // Keep Row 1 (Header row)
      if (rowNumber === 1) return;

      let hasMeaningfulData = false;

      row.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value;
        if (val !== null && val !== undefined) {
          const strVal =
            typeof val === 'object' && val && 'text' in val
              ? (val as { text: string }).text
              : String(val);

          const trimmed = strVal.trim();
          if (trimmed !== '') {
            hasMeaningfulData = true;
            // Trim whitespace directly on string cells
            if (typeof val === 'string') {
              cell.value = trimmed;
            }
          }
        }
      });

      if (!hasMeaningfulData) {
        rowsToDelete.push(rowNumber);
      }
    });

    // If there are empty rows to delete, strip them from bottom to top
    if (rowsToDelete.length > 0) {
      rowsToDelete
        .sort((a, b) => b - a)
        .forEach((rowNum) => {
          productsSheet.spliceRows(rowNum, 1);
        });

      const buffer = await workbook.xlsx.writeBuffer();
      return new File([buffer], file.name, {
        type:
          file.type ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    return file;
  } catch (err) {
    console.warn(
      'Could not sanitize import file, uploading original file:',
      err
    );
    return file;
  }
}
