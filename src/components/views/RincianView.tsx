import React, { useState } from 'react';
import { PieChart, Printer } from 'lucide-react';
import { AppState, UserRolePermission } from '../../types';
import { formatRupiah, MONTH_NAMES_ID, printSectionToPdf } from '../../utils/formatters';

interface RincianViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
}

export const RincianView: React.FC<RincianViewProps> = ({ state, currentRole }) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonthNum = String(now.getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  // Filter transactions
  const expenseTxs = state.transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    if (t.date.slice(0, 4) !== selectedYear) return false;
    if (selectedMonth !== 'all' && t.date.slice(5, 7) !== selectedMonth) return false;
    return true;
  });

  const totalExpense = expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Group by category
  const categoryMap = new Map<string, number>();
  expenseTxs.forEach((t) => {
    const cat = t.category || 'Lainnya';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount || 0));
  });

  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

  const monthLabel =
    selectedMonth === 'all' ? 'Semua Bulan' : MONTH_NAMES_ID[Number(selectedMonth) - 1];

  const handleExportPdf = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #0f172a;">Rincian Pengeluaran per Kategori (${monthLabel} ${selectedYear})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Kategori Pengeluaran</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Total Nominal (Rp)</th>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Persentase</th>
            </tr>
          </thead>
          <tbody>
            ${
              sortedCategories.length === 0
                ? '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #64748b;">Tidak ada pengeluaran pada periode ini.</td></tr>'
                : sortedCategories
                    .map(
                      ([cat, amt]) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">${cat}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold; color: #e11d48;">${formatRupiah(amt)}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">${totalExpense ? ((amt / totalExpense) * 100).toFixed(2) : '0.00'}%</td>
              </tr>
            `
                    )
                    .join('')
            }
            <tr style="background: #f8fafc; font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #cbd5e1;">TOTAL PENGELUARAN</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #e11d48;">${formatRupiah(totalExpense)}</td>
              <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">100.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    printSectionToPdf(`Rincian Pengeluaran ${monthLabel} ${selectedYear}`, `Periode ${monthLabel} ${selectedYear}`, content);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs"
            >
              <option value="all">Semua Bulan</option>
              {MONTH_NAMES_ID.map((m, idx) => (
                <option key={m} value={String(idx + 1).padStart(2, '0')}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {permissions?.canExportReports && (
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Printer size={15} />
            <span>Export PDF LPJ</span>
          </button>
        )}
      </div>

      {/* Rincian Content Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={17} className="text-rose-500" />
              <span>Komposisi Pengeluaran ({monthLabel} {selectedYear})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengelompokan belanja kas untuk laporan pertanggungjawaban.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total Pengeluaran
            </span>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatRupiah(totalExpense)}
            </span>
          </div>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Belum ada catatan pengeluaran pada periode {monthLabel} {selectedYear}.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map(([cat, amt]) => {
              const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {cat}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        ({pct.toFixed(2)}%)
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupiah(amt)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal progress bar track */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
