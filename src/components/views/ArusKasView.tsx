import React, { useState } from 'react';
import { ArrowLeftRight, Printer } from 'lucide-react';
import { AppState, UserRolePermission, Account } from '../../types';
import { formatRupiah, MONTH_NAMES_ID, printSectionToPdf } from '../../utils/formatters';

interface ArusKasViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
}

export const ArusKasView: React.FC<ArusKasViewProps> = ({ state, currentRole }) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonthNum = String(now.getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState(curMonthNum);

  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  // Helper date boundaries
  const getPeriodBoundaries = (year: string, month: string) => {
    if (month === 'all') {
      return { start: `${year}-01-01`, end: `${year}-12-31` };
    }
    const mm = String(month).padStart(2, '0');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` };
  };

  const { start: startDate, end: endDate } = getPeriodBoundaries(selectedYear, selectedMonth);

  // Compute balance of account as of date
  const getBalanceAsOf = (acc: Account, cutoffDate: string): number => {
    let bal = Number(acc.initialBalance || 0);
    state.transactions.forEach((t) => {
      if (t.date >= cutoffDate) return; // Strictly before period
      if (t.type === 'transfer') {
        if (t.accountId === acc.id) bal -= Number(t.amount || 0);
        if (t.toAccountId === acc.id) bal += Number(t.amount || 0);
      } else if (t.accountId === acc.id) {
        bal += t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0);
      }
    });
    return bal;
  };

  // Transactions within period
  const periodTxs = state.transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );

  const kasAwalTotal = state.accounts.reduce(
    (sum, a) => sum + getBalanceAsOf(a, startDate),
    0
  );

  const totalMasukOps = periodTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalKeluarOps = periodTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const netCashFlow = totalMasukOps - totalKeluarOps;
  const kasAkhirTotal = kasAwalTotal + netCashFlow;

  // Breakdown per account
  const accountBreakdown = state.accounts.map((acc) => {
    const awal = getBalanceAsOf(acc, startDate);
    const inOps = periodTxs
      .filter((t) => t.accountId === acc.id && t.type === 'income')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const outOps = periodTxs
      .filter((t) => t.accountId === acc.id && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const inTrf = periodTxs
      .filter((t) => t.toAccountId === acc.id && t.type === 'transfer')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const outTrf = periodTxs
      .filter((t) => t.accountId === acc.id && t.type === 'transfer')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const masukTotal = inOps + inTrf;
    const keluarTotal = outOps + outTrf;
    const akhir = awal + masukTotal - keluarTotal;

    return {
      name: acc.name,
      type: acc.type,
      awal,
      masukTotal,
      keluarTotal,
      akhir,
    };
  });

  const monthLabel =
    selectedMonth === 'all' ? 'Tahun Penuh' : MONTH_NAMES_ID[Number(selectedMonth) - 1];

  const handleExportPdf = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #0f172a;">Laporan Arus Kas (Cash Flow)</h3>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Periode: ${monthLabel} ${selectedYear} (${startDate} s/d ${endDate})</p>

        <!-- Summary -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; font-weight: bold;">Kas &amp; Setara Kas Awal Periode:</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; font-weight: bold;">${formatRupiah(kasAwalTotal)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #059669;">Kas Masuk dari Aktivitas Operasi (Pemasukan):</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; color: #059669;">${formatRupiah(totalMasukOps)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #e11d48;">Kas Keluar untuk Beban Operasi (Pengeluaran):</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; color: #e11d48;">${formatRupiah(totalKeluarOps)}</td>
          </tr>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td style="padding: 10px; border: 1px solid #cbd5e1;">Kenaikan / (Penurunan) Kas Bersih:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; color: ${netCashFlow >= 0 ? '#059669' : '#e11d48'}">${formatRupiah(netCashFlow)}</td>
          </tr>
          <tr style="background: #e2e8f0; font-weight: bold;">
            <td style="padding: 10px; border: 1px solid #cbd5e1;">Kas &amp; Setara Kas Akhir Periode:</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; text-align: right; font-size: 14px; color: #0f172a;">${formatRupiah(kasAkhirTotal)}</td>
          </tr>
        </table>

        <!-- Table per Account -->
        <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #0f172a;">Mutasi Arus Kas per Rekening Operasional</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Nama Akun</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Kas Awal</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Total Masuk</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Total Keluar</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Kas Akhir</th>
            </tr>
          </thead>
          <tbody>
            ${accountBreakdown
              .map(
                (a) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.name} <span style="color:#64748b;">(${a.type})</span></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">${formatRupiah(a.awal)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #059669;">${formatRupiah(a.masukTotal)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; color: #e11d48;">${formatRupiah(a.keluarTotal)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">${formatRupiah(a.akhir)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    printSectionToPdf(`Laporan Arus Kas ${monthLabel} ${selectedYear}`, `Periode ${monthLabel} ${selectedYear}`, content);
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
              <option value="all">Semua Bulan (Tahun Penuh)</option>
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

      {/* Arus Kas Summary Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight size={17} className="text-emerald-500" />
            <span>Laporan Arus Kas ({monthLabel} {selectedYear})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pergerakan kas masuk, kas keluar, dan mutasi saldo antar akun.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300">
            <span>Kas &amp; Setara Kas Awal Periode</span>
            <span className="font-mono font-bold">{formatRupiah(kasAwalTotal)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-emerald-600 dark:text-emerald-400">
            <span>Kas Masuk dari Penerimaan Operasional (+)</span>
            <span className="font-mono font-bold">{formatRupiah(totalMasukOps)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
            <span>Kas Keluar untuk Belanja Operasional (-)</span>
            <span className="font-mono font-bold">{formatRupiah(totalKeluarOps)}</span>
          </div>

          <div className="flex items-center justify-between py-2.5 font-bold text-slate-800 dark:text-slate-200">
            <span>Kenaikan / (Penurunan) Kas Bersih</span>
            <span
              className={`font-mono text-sm ${
                netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatRupiah(netCashFlow)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <div>
            <div>Kas &amp; Setara Kas Akhir Periode</div>
            <div className="text-[10px] text-slate-500 font-normal">
              Saldo kas riil per {endDate}
            </div>
          </div>
          <div className="text-lg font-mono text-emerald-600 dark:text-emerald-400">
            {formatRupiah(kasAkhirTotal)}
          </div>
        </div>
      </div>

      {/* Rincian Arus Kas per Akun Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Rincian Mutasi Kas per Akun Rekening
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Nama Akun</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kas Awal</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total Masuk</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total Keluar</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kas Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accountBreakdown.map((a) => (
                <tr key={a.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {a.name}
                    <span className="text-[10px] text-slate-400 block font-normal">{a.type}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {formatRupiah(a.awal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatRupiah(a.masukTotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    {formatRupiah(a.keluarTotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatRupiah(a.akhir)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
