import ExcelJS from 'exceljs';

export interface ExportSummaryStat {
  label: string;
  value: string;
}

/**
 * Export data array to native Excel XLSX file (.xlsx)
 */
export async function exportToXLSX<T extends Record<string, any>>(
  filename: string,
  headers: { key: keyof T | string; label: string }[],
  data: T[]
) {
  if (!data.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.columns = headers.map((h) => ({
    header: h.label,
    key: String(h.key),
    width: Math.max(h.label.length + 5, 18),
  }));

  data.forEach((item) => {
    const rowObj: Record<string, any> = {};
    headers.forEach((h) => {
      rowObj[String(h.key)] = item[h.key as keyof T] ?? '';
    });
    worksheet.addRow(rowObj);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data array to CSV / Excel with UTF-8 BOM for Arabic support
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  headers: { key: keyof T | string; label: string }[],
  data: T[],
  summaryStats?: ExportSummaryStat[]
) {
  if (!data.length) return;

  const rows: string[] = [];

  if (summaryStats && summaryStats.length > 0) {
    rows.push(`"Summary Statistics",`);
    summaryStats.forEach((stat) => {
      rows.push(
        `"${stat.label.replace(/"/g, '""')}","${stat.value.replace(/"/g, '""')}"`
      );
    });
    rows.push('');
    rows.push(`"Detailed Records",`);
  }

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  rows.push(headerRow);

  data.forEach((item) => {
    const row = headers
      .map((h) => {
        const val = item[h.key as keyof T] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
    rows.push(row);
  });

  // \uFEFF is UTF-8 Byte Order Mark for Excel Arabic support
  const csvContent = '\uFEFF' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
