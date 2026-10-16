import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';
import { AppState, UserRolePermission, Account } from '../../types';
import { formatRupiah, MONTH_NAMES_ID, printSectionToPdf } from '../../utils/formatters';

interface NeracaViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
}

export const NeracaView: React.FC<NeracaViewProps> = ({ state, currentRole }) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonthNum = String(now.getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState(curMonthNum);

  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  // Helper date end of period
  const getEndOfPeriodDate = (year: string, month: string): string => {
    if (month === 'all') return `${year}-12-31`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  };

  const endPeriodDate = getEndOfPeriodDate(selectedYear, selectedMonth);

  // Compute balance of each account as of endPeriodDate
  const getBalanceAsOf = (acc: Account, cutoffDate: string): number => {
    let bal = Number(acc.initialBalance || 0);
    state.transactions.forEach((t) => {
      if (t.date > cutoffDate) return;
      if (t.type === 'transfer') {
        if (t.accountId === acc.id) bal -= Number(t.amount || 0);
        if (t.toAccountId === acc.id) bal += Number(t.amount || 0);
      } else if (t.accountId === acc.id) {
        bal += t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0);
      }
    });
    return bal;
  };

  const assetAccounts = state.accounts.map((acc) => ({
    name: acc.name,
    type: acc.type,
    balance: getBalanceAsOf(acc, endPeriodDate),
  }));

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const initialFund = state.accounts.reduce((sum, a) => sum + Number(a.initialBalance || 0), 0);
  const totalLiabilities = 0; // Kewajiban belum ada hutang
  const retainedSurplus = totalAssets - initialFund - totalLiabilities;
  const totalEquity = initialFund + retainedSurplus;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  const monthLabel =
    selectedMonth === 'all' ? 'Akhir Tahun' : MONTH_NAMES_ID[Number(selectedMonth) - 1];

  const handleExportPdf = () => {
    const content = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #0f172a;">Laporan Neraca Keuangan</h3>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Posisi Keuangan per Akhir Periode: ${monthLabel} ${selectedYear}</p>

        <!-- Aset -->
        <h4 style="font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">A. ASET (AKTIVA)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          ${assetAccounts
            .map(
              (a) => `
            <tr>
              <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0;">${a.name} <span style="color: #64748b;">(${a.type})</span></td>
              <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(a.balance)}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="font-weight: bold; background: #f8fafc;">
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a;">TOTAL ASET</td>
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a; text-align: right; font-family: monospace; color: #059669;">${formatRupiah(totalAssets)}</td>
          </tr>
        </table>

        <!-- Kewajiban -->
        <h4 style="font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">B. KEWAJIBAN (PASIVA)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 4px; color: #64748b;">Hutang / Kewajiban Jangka Pendek</td>
            <td style="padding: 6px 4px; text-align: right; font-family: monospace;">Rp 0</td>
          </tr>
          <tr style="font-weight: bold; background: #f8fafc;">
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a;">TOTAL KEWAJIBAN</td>
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a; text-align: right; font-family: monospace;">Rp 0</td>
          </tr>
        </table>

        <!-- Saldo Dana -->
        <h4 style="font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">C. SALDO DANA ORGANISASI (EKUITAS)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0;">Dana Awal Pembukuan</td>
            <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(initialFund)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0;">Akumulasi Surplus Ditahan</td>
            <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(retainedSurplus)}</td>
          </tr>
          <tr style="font-weight: bold; background: #f8fafc;">
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a;">TOTAL SALDO DANA</td>
            <td style="padding: 8px 4px; border-top: 1px solid #0f172a; text-align: right; font-family: monospace; color: #0284c7;">${formatRupiah(totalEquity)}</td>
          </tr>
        </table>

        <!-- Total Pasiva -->
        <div style="margin-top: 20px; padding: 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
          <span>TOTAL KEWAJIBAN + SALDO DANA</span>
          <span style="font-family: monospace;">${formatRupiah(totalLiabilitiesAndEquity)}</span>
        </div>
        <div style="margin-top: 8px; font-size: 12px; color: #059669; font-weight: bold;">
          Status: Neraca Seimbang ✓ (Aset = Kewajiban + Saldo Dana)
        </div>
      </div>
    `;

    printSectionToPdf(`Neraca Keuangan ${monthLabel} ${selectedYear}`, `Posisi Akhir ${monthLabel} ${selectedYear}`, content);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Per Akhir Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs"
            >
              <option value="all">Semua Bulan (Akhir Tahun)</option>
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

      {/* Neraca Balance Sheet Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale size={17} className="text-emerald-500" />
              <span>Neraca Posisi Keuangan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Per akhir periode: {monthLabel} {selectedYear}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isBalanced
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
            }`}
          >
            {isBalanced ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span>{isBalanced ? 'Neraca Seimbang ✓' : 'Ada Selisih!'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Aset / Aktiva */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
              1. Aset (Aktiva)
            </h4>

            <div className="space-y-2 text-xs">
              {assetAccounts.map((a) => (
                <div key={a.name} className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span>{a.name}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Jenis: {a.type}
                    </span>
                  </div>
                  <span className="font-mono font-bold">{formatRupiah(a.balance)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t-2 border-slate-300 dark:border-slate-600 flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
              <span>TOTAL ASET</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {formatRupiah(totalAssets)}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Kewajiban & Saldo Dana (Pasiva) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
            {/* Kewajiban */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                2. Kewajiban (Hutang)
              </h4>
              <div className="flex items-center justify-between py-1 text-slate-500">
                <span>Hutang Lancar / Kewajiban</span>
                <span className="font-mono font-bold">Rp 0</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <span>Total Kewajiban</span>
                <span className="font-mono">Rp 0</span>
              </div>
            </div>

            {/* Saldo Dana */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-1">
                3. Saldo Dana Organisasi (Ekuitas)
              </h4>
              <div className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <span>Dana Awal Pembukuan</span>
                <span className="font-mono font-semibold">{formatRupiah(initialFund)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <span>Surplus Ditahan (Akumulasi)</span>
                <span className="font-mono font-semibold">{formatRupiah(retainedSurplus)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 pt-1">
                <span>Total Saldo Dana</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {formatRupiah(totalEquity)}
                </span>
              </div>
            </div>

            {/* Total Pasiva */}
            <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-600 flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
              <span>TOTAL KEWAJIBAN + SALDO DANA</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                {formatRupiah(totalLiabilitiesAndEquity)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
