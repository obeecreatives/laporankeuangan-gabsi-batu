export const PROJECT_NAME = 'GABSI Kota Batu';
export const APP_SUBTITLE = 'Laporan Keuangan Bendahara - Bridge Kota Batu';
export const APP_FOOTER_DEV = 'Laporan Keuangan Bendahara . Bridge Kota Batu . Developed by Lalu Mahendra/obeecreatives';
export const PDF_FOOTER_TEXT = 'Laporan Keuangan Bendahara - Bridge Kota Batu';

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatRupiah(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return 'Rp ' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = MONTH_NAMES_ID[Number(parts[1]) - 1] || parts[1];
      const d = parseInt(parts[2], 10);
      return `${d} ${m} ${y}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateTimeId(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = MONTH_NAMES_ID[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export function generateUid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export function exportToCsvFile(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number) => {
    let str = String(cell === undefined || cell === null ? '' : cell);
    if (/[";\n\r]/.test(str)) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines = [
    headers.map(escapeCell).join(';'),
    ...rows.map((r) => r.map(escapeCell).join(';')),
  ];

  // \uFEFF BOM for Excel utf-8 recognition
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printSectionToPdf(title: string, subheader: string, contentHtml: string): void {
  const printContainer = document.getElementById('print-area-hidden');
  if (!printContainer) return;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  printContainer.innerHTML = `
    <div style="font-family: system-ui, sans-serif; padding: 24px; color: #1e293b;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <div style="font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
          PENGURUS CABANG GABSI KOTA BATU
        </div>
        <div style="font-size: 16px; font-weight: 600; color: #334155; margin-top: 4px;">
          ${title}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          ${subheader} • Dicetak pada: ${todayStr}
        </div>
      </div>

      <div style="margin-top: 16px;">
        ${contentHtml}
      </div>

      <div style="margin-top: 40px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
        <span>${PDF_FOOTER_TEXT}</span>
        <span>${APP_FOOTER_DEV}</span>
      </div>
    </div>
  `;

  const originalTitle = document.title;
  document.title = `${PROJECT_NAME} - ${title}`;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 500);
}
