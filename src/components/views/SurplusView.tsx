import React, { useState } from 'react';
import { TrendingUp, Printer } from 'lucide-react';
import { AppState, UserRolePermission } from '../../types';
import { formatRupiah, MONTH_NAMES_ID, printSectionToPdf } from '../../utils/formatters';

interface SurplusViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
}

export const SurplusView: React.FC<SurplusViewProps> = ({ state, currentRole }) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());

  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  // Filter transactions
  const periodTxs = state.transactions.filter((t) => {
    if (t.type !== 'income' && t.type !== 'expense') return false;
    if (t.date.slice(0, 4) !== selectedYear) return false;
    if (selectedMonth !== 'all' && t.date.slice(5, 7) !== selectedMonth) return false;
    return true;
  });

  const incomeMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();

  periodTxs.forEach((t) => {
    const cat = t.category || 'Lainnya';
    const amt = Number(t.amount || 0);
    if (t.type === 'income') {
      incomeMap.set(cat, (incomeMap.get(cat) || 0) + amt);
    } else {
      expenseMap.set(cat, (expenseMap.get(cat) || 0) + amt);
    }
  });

  const incomeItems = Array.from(incomeMap.entries()).sort((a, b) => b[1] - a[1]);
  const expenseItems = Array.from(expenseMap.entries()).sort((a, b) => b[1] - a[1]);

  const totalIncome = incomeItems.reduce((s, [, a]) => s + a, 0);
  const totalExpense = expenseItems.reduce((s, [, a]) => s + a, 0);
  const netSurplus = totalIncome - totalExpense;

  const monthLabel =
    selectedMonth === 'all' ? 'Semua Bulan' : MONTH_NAMES_ID[Number(selectedMonth) - 1];

  const handleExportPdf = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0f172a;">Laporan Realisasi Pendapatan &amp; Belanja (${monthLabel} ${selectedYear})</h3>

        <!-- Pemasukan -->
        <h4 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 6px; color: #059669; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">A. PEMASUKAN DANA</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
          ${
            incomeItems.length === 0
              ? '<tr><td style="padding: 6px; color: #64748b;">Tidak ada pemasukan tercatat pada periode ini.</td></tr>'
              : incomeItems
                  .map(
                    ([cat, amt]) => `
              <tr>
                <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0;">${cat}</td>
                <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(amt)}</td>
              </tr>
            `
                  )
                  .join('')
          }
          <tr style="font-weight: bold; background: #f8fafc;">
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a;">TOTAL PEMASUKAN</td>
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a; text-align: right; font-family: monospace; color: #059669;">${formatRupiah(totalIncome)}</td>
          </tr>
        </table>

        <!-- Pengeluaran -->
        <h4 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 6px; color: #e11d48; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">B. PENGELUARAN DANA</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
          ${
            expenseItems.length === 0
              ? '<tr><td style="padding: 6px; color: #64748b;">Tidak ada pengeluaran tercatat pada periode ini.</td></tr>'
              : expenseItems
                  .map(
                    ([cat, amt]) => `
              <tr>
                <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0;">${cat}</td>
                <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(amt)}</td>
              </tr>
            `
                  )
                  .join('')
          }
          <tr style="font-weight: bold; background: #f8fafc;">
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a;">TOTAL PENGELUARAN</td>
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a; text-align: right; font-family: monospace; color: #e11d48;">${formatRupiah(totalExpense)}</td>
          </tr>
        </table>

        <!-- Net -->
        <div style="margin-top: 24px; padding: 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
          <span>${netSurplus >= 0 ? 'SURPLUS BERSIH PERIODE BERJALAN' : 'DEFISIT BERSIH PERIODE BERJALAN'}</span>
          <span style="font-family: monospace; color: ${netSurplus >= 0 ? '#059669' : '#e11d48'}">${formatRupiah(Math.abs(netSurplus))}</span>
        </div>
      </div>
    `;

    printSectionToPdf(`Laporan Surplus Defisit ${monthLabel} ${selectedYear}`, `Periode ${monthLabel} ${selectedYear}`, content);
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

      {/* Main Surplus/Defisit Statement Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={17} className="text-emerald-500" />
            <span>Laporan Surplus / Defisit ({monthLabel} {selectedYear})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perbandingan total penerimaan kas terhadap total beban pengeluaran organisasi.
          </p>
        </div>

        {/* Section Pemasukan */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-emerald-950 pb-1 uppercase tracking-wider flex items-center justify-between">
            <span>A. Penerimaan Kas (Pemasukan)</span>
            <span className="font-mono text-emerald-600 font-bold">{formatRupiah(totalIncome)}</span>
          </div>

          <div className="space-y-1.5 text-xs pl-2">
            {incomeItems.length === 0 ? (
              <div className="text-slate-400 py-1">Tidak ada pemasukan tercatat pada periode ini.</div>
            ) : (
              incomeItems.map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 border-b border-slate-100/60 dark:border-slate-800/60">
                  <span>{cat}</span>
                  <span className="font-mono font-semibold">{formatRupiah(amt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section Pengeluaran */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-rose-700 dark:text-rose-400 border-b border-rose-100 dark:border-rose-950 pb-1 uppercase tracking-wider flex items-center justify-between">
            <span>B. Pengeluaran Kas (Beban Operasional)</span>
            <span className="font-mono text-rose-600 font-bold">{formatRupiah(totalExpense)}</span>
          </div>

          <div className="space-y-1.5 text-xs pl-2">
            {expenseItems.length === 0 ? (
              <div className="text-slate-400 py-1">Tidak ada pengeluaran tercatat pada periode ini.</div>
            ) : (
              expenseItems.map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 border-b border-slate-100/60 dark:border-slate-800/60">
                  <span>{cat}</span>
                  <span className="font-mono font-semibold">{formatRupiah(amt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Net Bottom Line */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold ${
            netSurplus >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div>
            <div>{netSurplus >= 0 ? 'Surplus Bersih Periode Berjalan' : 'Defisit Bersih Periode Berjalan'}</div>
            <div className="text-[11px] font-normal opacity-80 mt-0.5">
              Selisih total pendapatan dikurangi seluruh beban operasional
            </div>
          </div>
          <div className="text-xl font-mono">
            {formatRupiah(Math.abs(netSurplus))}
          </div>
        </div>
      </div>
    </div>
  );
};
