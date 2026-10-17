import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Receipt,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AppState, UserRolePermission, ViewTab } from '../../types';
import { formatRupiah, formatNumber, formatDateId } from '../../utils/formatters';

interface BerandaViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  onNavigateTab: (tab: ViewTab) => void;
  getAccountBalance: (accountId: string) => number;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  state,
  currentRole,
  onNavigateTab,
  getAccountBalance,
}) => {
  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonth = String(now.getMonth() + 1).padStart(2, '0');

  // Total balance of all accounts
  const totalBalance = state.accounts.reduce((acc, a) => acc + getAccountBalance(a.id), 0);

  // Month transactions
  const monthTxs = state.transactions.filter(
    (t) => t.date.slice(0, 4) === curYear && t.date.slice(5, 7) === curMonth
  );

  const monthIncome = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const monthExpense = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const monthNet = monthIncome - monthExpense;

  // Negative accounts check
  const negativeAccounts = state.accounts.filter((a) => getAccountBalance(a.id) < 0);

  // Active member dues check for this month
  const activeMembers = state.members.filter((m) => m.status === 'Aktif');
  const paidMembersCount = activeMembers.filter((m) =>
    state.transactions.some(
      (t) =>
        t.type === 'income' &&
        t.memberId === m.id &&
        t.category.toLowerCase().includes('iuran') &&
        t.date.slice(0, 4) === curYear &&
        t.date.slice(5, 7) === curMonth
    )
  ).length;

  // Recent 6 transactions
  const recentTransactions = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const accountMap = new Map(state.accounts.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-6">
      {/* Alert for negative accounts */}
      {negativeAccounts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="text-xs">
            <div className="font-bold">
              Perhatian: {negativeAccounts.length} Akun Kas/Bank Mengalami Saldo Minus!
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {negativeAccounts.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 font-semibold text-rose-800 dark:text-rose-300 font-mono"
                >
                  {a.name}: {formatRupiah(getAccountBalance(a.id))}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Saldo Semua Akun
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
            {formatRupiah(totalBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>{formatNumber(state.accounts.length)} Akun Kas &amp; Bank Aktif</span>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pemasukan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatRupiah(monthIncome)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Periode: {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pengeluaran Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatRupiah(monthExpense)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Realisasi belanja operasional
          </div>
        </div>

        {/* Surplus / Defisit Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {monthNet >= 0 ? 'Surplus Bersih' : 'Defisit Bersih'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Scale size={18} />
            </div>
          </div>
          <div
            className={`mt-2 text-xl font-bold font-mono ${
              monthNet >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(Math.abs(monthNet))}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {monthNet >= 0 ? 'Surplus operasional' : 'Defisit - perlu efisiensi'}
          </div>
        </div>
      </div>

      {/* Second Row: Dues Status + Account Quick Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Iuran Progress Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                <span>Pelunasan Iuran Anggota</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Bulan Ini
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {formatNumber(paidMembersCount)} / {formatNumber(activeMembers.length)}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {activeMembers.length
                    ? Math.round((paidMembersCount / activeMembers.length) * 100)
                    : 0}
                  % Lunas
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      activeMembers.length
                        ? (paidMembersCount / activeMembers.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                {formatNumber(activeMembers.length - paidMembersCount)} anggota belum menyelesaikan iuran bulan ini.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('iuran')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Buka Menu Iuran</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Saldo Akun List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" />
                <span>Posisi Saldo Kas &amp; Rekening Bank</span>
              </h3>
              <button
                onClick={() => onNavigateTab('akun')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Kelola Akun</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.accounts.map((acc) => {
                const bal = getAccountBalance(acc.id);
                const isNeg = bal < 0;
                return (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                          {acc.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {acc.type}
                        </span>
                      </div>
                      <div
                        className={`text-sm font-bold font-mono mt-2 truncate ${
                          isNeg ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatRupiah(bal)}
                      </div>
                    </div>
                    {isNeg && (
                      <span className="text-[9px] text-rose-600 font-semibold mt-1">
                        ⚠ Saldo Minus
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt size={17} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Transaksi Terkini
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('transaksi')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Transaksi</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Jenis</th>
                <th className="py-2.5 px-3 font-semibold">Akun Kas/Bank</th>
                <th className="py-2.5 px-3 font-semibold">Kategori &amp; Keterangan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada catatan transaksi kas.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const isTransfer = tx.type === 'transfer';
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {formatDateId(tx.date)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isTransfer
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {isTransfer ? 'Transfer' : isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {isTransfer ? (
                          <span>
                            {accountMap.get(tx.accountId) || '—'} →{' '}
                            {accountMap.get(tx.toAccountId || '') || '—'}
                          </span>
                        ) : (
                          accountMap.get(tx.accountId) || '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                        <div className="font-semibold">{tx.category || 'Transfer Antar Akun'}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {tx.desc || '—'}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-bold ${
                          isTransfer
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatRupiah(tx.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
