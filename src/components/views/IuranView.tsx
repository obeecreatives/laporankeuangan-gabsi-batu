import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Calendar, User, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import { AppState, UserRolePermission, Transaction } from '../../types';
import { formatRupiah, formatDateId, MONTH_NAMES_ID, generateUid } from '../../utils/formatters';

interface IuranViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  userEmail: string;
  onRecordDues: (tx: Transaction) => void;
}

export const IuranView: React.FC<IuranViewProps> = ({
  state,
  currentRole,
  userEmail,
  onRecordDues,
}) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonthNum = String(now.getMonth() + 1).padStart(2, '0');

  // Input states
  const [selectedMemberId, setSelectedMemberId] = useState(state.members[0]?.id || '');
  const [targetMonth, setTargetMonth] = useState(curMonthNum);
  const [targetYear, setTargetYear] = useState(curYear);
  const [targetAccountId, setTargetAccountId] = useState(state.accounts[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>(state.members[0]?.monthlyDues || '');
  const [paymentDate, setPaymentDate] = useState(now.toISOString().slice(0, 10));

  // Rekap table filter
  const [rekapMonth, setRekapMonth] = useState(curMonthNum);
  const [rekapYear, setRekapYear] = useState(curYear);

  const activeMembers = state.members.filter((m) => m.status === 'Aktif');

  const handleMemberChange = (memId: string) => {
    setSelectedMemberId(memId);
    const m = state.members.find((x) => x.id === memId);
    if (m) {
      setAmount(m.monthlyDues);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = state.members.find((m) => m.id === selectedMemberId);
    if (!mem) return;

    const monthLabel = MONTH_NAMES_ID[Number(targetMonth) - 1];

    // Check duplicate
    const alreadyPaid = state.transactions.some(
      (t) =>
        t.type === 'income' &&
        t.memberId === mem.id &&
        t.category.toLowerCase().includes('iuran') &&
        t.date.slice(0, 4) === String(targetYear) &&
        t.date.slice(5, 7) === targetMonth
    );

    if (alreadyPaid) {
      if (!confirm(`${mem.name} sudah tercatat membayar iuran ${monthLabel} ${targetYear}. Tetap catat pembayaran ini?`)) {
        return;
      }
    }

    const tx: Transaction = {
      id: generateUid(),
      date: paymentDate,
      type: 'income',
      accountId: targetAccountId,
      category: 'Iuran Anggota',
      desc: `Iuran Wajib ${monthLabel} ${targetYear} - ${mem.name}`,
      amount: Number(amount),
      memberId: mem.id,
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
    };

    onRecordDues(tx);
    alert(`Pembayaran iuran ${mem.name} untuk bulan ${monthLabel} ${targetYear} berhasil dicatat!`);
  };

  return (
    <div className="space-y-6">
      {/* Form Catat Setoran Iuran */}
      {permissions?.canManageDues && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/80 mb-4">
            <Sparkles size={17} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Catat Pembayaran Iuran Anggota
            </h3>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Anggota (Aktif)
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {activeMembers.length === 0 ? (
                    <option value="">-- Belum ada anggota terdaftar --</option>
                  ) : (
                    activeMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({formatRupiah(m.monthlyDues)}/bln)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Untuk Bulan &amp; Tahun
                </label>
                <div className="flex gap-2">
                  <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {MONTH_NAMES_ID.map((m, idx) => (
                      <option key={m} value={String(idx + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Masuk ke Akun Kas/Bank
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {state.accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Setoran
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <CheckCircle2 size={15} />
                  <span>Simpan Pembayaran Iuran</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Rekap Pelunasan Iuran Anggota */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rekap Pelunasan Iuran Anggota
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Periode:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {MONTH_NAMES_ID[Number(rekapMonth) - 1]} {rekapYear}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={rekapMonth}
              onChange={(e) => setRekapMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
            >
              {MONTH_NAMES_ID.map((m, idx) => (
                <option key={m} value={String(idx + 1).padStart(2, '0')}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={rekapYear}
              onChange={(e) => setRekapYear(e.target.value)}
              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono font-semibold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Nama Anggota</th>
                <th className="py-2.5 px-3 font-semibold">No. HP</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tarif Iuran</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status Pelunasan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tgl Bayar Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada anggota aktif terdaftar.
                  </td>
                </tr>
              ) : (
                activeMembers.map((m) => {
                  const duesTx = state.transactions.find(
                    (t) =>
                      t.type === 'income' &&
                      t.memberId === m.id &&
                      t.category.toLowerCase().includes('iuran') &&
                      t.date.slice(0, 4) === rekapYear &&
                      t.date.slice(5, 7) === rekapMonth
                  );

                  const isLunas = !!duesTx;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {m.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatRupiah(m.monthlyDues)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLunas
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {isLunas ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>Lunas</span>
                            </>
                          ) : (
                            <>
                              <Clock size={11} />
                              <span>Belum Bayar</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {duesTx ? formatDateId(duesTx.date) : '—'}
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
