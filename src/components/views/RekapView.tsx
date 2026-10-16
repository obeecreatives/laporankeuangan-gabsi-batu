import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Scale, Download, Printer } from 'lucide-react';
import { AppState, UserRolePermission } from '../../types';
import { formatRupiah, MONTH_NAMES_ID, printSectionToPdf } from '../../utils/formatters';

interface RekapViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  getAccountBalance: (accountId: string) => number;
}

export const RekapView: React.FC<RekapViewProps> = ({
  state,
  currentRole,
  getAccountBalance,
}) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());

  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  const [selectedYear, setSelectedYear] = useState(curYear);

  // Filter transactions for this year & prev year
  const yearTxs = state.transactions.filter((t) => t.date.slice(0, 4) === selectedYear);
  const prevYear = String(Number(selectedYear) - 1);
  const prevYearTxs = state.transactions.filter((t) => t.date.slice(0, 4) === prevYear);

  const totalIncome = yearTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpense = yearTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const netSurplus = totalIncome - totalExpense;

  const prevIncome = prevYearTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const prevExpense = prevYearTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const prevNet = prevIncome - prevExpense;

  // Monthly breakdown
  const monthlyData = MONTH_NAMES_ID.map((mName, idx) => {
    const mm = String(idx + 1).padStart(2, '0');
    const mIncome = yearTxs
      .filter((t) => t.type === 'income' && t.date.slice(5, 7) === mm)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const mExpense = yearTxs
      .filter((t) => t.type === 'expense' && t.date.slice(5, 7) === mm)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { name: mName.slice(0, 3), full: mName, income: mIncome, expense: mExpense };
  });

  const maxVal = Math.max(1, ...monthlyData.map((d) => Math.max(d.income, d.expense)));

  // YoY percent helper
  const renderPctChange = (curr: number, prev: number, invertGood = false) => {
    if (prevYearTxs.length === 0) {
      return <div className="text-[10px] text-slate-400 mt-1">Belum ada data {prevYear}</div>;
    }
    if (prev === 0) {
      return curr === 0 ? null : (
        <div className="text-[10px] text-slate-400 mt-1">Basis {prevYear}: Rp 0</div>
      );
    }
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    const isUp = pct >= 0;
    const isPositiveOutcome = invertGood ? !isUp : isUp;
    return (
      <div
        className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
          isPositiveOutcome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        <span>{isUp ? '↑' : '↓'}</span>
        <span>{Math.abs(pct).toFixed(2)}% dari tahun {prevYear}</span>
      </div>
    );
  };

  const handleExportPdf = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #0f172a;">Ringkasan Realisasi Keuangan Tahun ${selectedYear}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Total Pemasukan:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #059669; font-family: monospace; text-align: right;">${formatRupiah(totalIncome)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Total Pengeluaran:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #e11d48; font-family: monospace; text-align: right;">${formatRupiah(totalExpense)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: bold;">Surplus / Defisit Bersih:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace; text-align: right; color: ${netSurplus >= 0 ? '#059669' : '#e11d48'}">${formatRupiah(netSurplus)}</td>
          </tr>
        </table>

        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0f172a;">Rincian Mutasi Kas per Bulan (${selectedYear})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #e2e8f0; font-weight: bold;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Bulan</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Pemasukan</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Pengeluaran</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Surplus/Defisit</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData
              .map(
                (m) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.full}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #059669;">${formatRupiah(m.income)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #e11d48;">${formatRupiah(m.expense)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">${formatRupiah(m.income - m.expense)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    printSectionToPdf(`Rekap Keuangan Tahunan ${selectedYear}`, `Tahun Buku ${selectedYear}`, content);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Filter & PDF Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Tahun Buku:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {permissions?.canExportReports && (
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Printer size={15} />
            <span>Export PDF Resmi LPJ</span>
          </button>
        )}
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Pemasukan {selectedYear}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(totalIncome)}
          </div>
          {renderPctChange(totalIncome, prevIncome, false)}
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Pengeluaran {selectedYear}
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(totalExpense)}
          </div>
          {renderPctChange(totalExpense, prevExpense, true)}
        </div>

        {/* Net Surplus */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {netSurplus >= 0 ? 'Surplus Bersih' : 'Defisit Bersih'} {selectedYear}
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              netSurplus >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(Math.abs(netSurplus))}
          </div>
          {renderPctChange(netSurplus, prevNet, false)}
        </div>
      </div>

      {/* Monthly Bar Comparison Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Pemasukan vs Pengeluaran per Bulan ({selectedYear})
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Pemasukan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300">Pengeluaran</span>
            </span>
          </div>
        </div>

        {/* Bar chart canvas */}
        <div className="pt-4 flex items-end gap-1.5 sm:gap-3 h-52 sm:h-64 px-2 overflow-x-auto">
          {monthlyData.map((d) => {
            const incHeight = maxVal > 0 ? Math.round((d.income / maxVal) * 100) : 0;
            const expHeight = maxVal > 0 ? Math.round((d.expense / maxVal) * 100) : 0;

            return (
              <div
                key={d.name}
                className="flex-1 min-w-[38px] flex flex-col items-center h-full justify-end group relative"
              >
                {/* Floating tooltip on hover */}
                <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl z-20 whitespace-nowrap">
                  <div className="font-bold">{d.full} {selectedYear}</div>
                  <div className="text-emerald-400">Masuk: {formatRupiah(d.income)}</div>
                  <div className="text-rose-400">Keluar: {formatRupiah(d.expense)}</div>
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-44 sm:h-52">
                  <div
                    className="w-2.5 sm:w-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(incHeight, 2)}%` }}
                  />
                  <div
                    className="w-2.5 sm:w-3.5 bg-rose-500 hover:bg-rose-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(expHeight, 2)}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                  {d.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
