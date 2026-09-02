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
      rows.push(`"${stat.label.replace(/"/g, '""')}","${stat.value.replace(/"/g, '""')}"`);
    });
    rows.push('');
    rows.push(`"Detailed Orders",`);
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

/**
 * Export table data as PDF using printable window document
 */
export function exportToPDF<T extends Record<string, any>>(
  title: string,
  headers: { key: keyof T | string; label: string }[],
  data: T[],
  summaryStats?: ExportSummaryStat[]
) {
  if (!data.length) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const summaryHtml =
    summaryStats && summaryStats.length > 0
      ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px;">
          ${summaryStats
            .map(
              (stat) => `
              <div style="padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase;">${stat.label}</div>
                <div style="font-size: 15px; font-weight: 700; color: #111827; margin-top: 4px;">${stat.value}</div>
              </div>
            `
            )
            .join('')}
        </div>
      `
      : '';

  const tableHeaders = headers.map((h) => `<th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: start; font-size: 12px; color: #6b7280;">${h.label}</th>`).join('');
  const tableRows = data
    .map(
      (item) =>
        `<tr style="border-bottom: 1px solid #f3f4f6;">${headers
          .map(
            (h) =>
              `<td style="padding: 10px; font-size: 12px; color: #111827;">${String(item[h.key] ?? '')}</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const now = new Date();
  const generatedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: #111827; }
          h1 { font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">Generated on ${generatedDate}</p>
        ${summaryHtml}
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
