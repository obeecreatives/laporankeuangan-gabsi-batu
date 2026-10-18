import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, Calendar, User, Wallet, ArrowRight, AlertCircle, Printer } from 'lucide-react';
import { AppState, UserRolePermission, Transaction } from '../../types';
import { formatRupiah, formatNumber, formatDateId, MONTH_NAMES_ID, generateUid, printSectionToPdf } from '../../utils/formatters';
import { CurrencyAmountInput } from '../CurrencyAmountInput';

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

  const rekapList = activeMembers.map((m) => {
    const duesTx = state.transactions.find(
      (t) =>
        t.type === 'income' &&
        t.memberId === m.id &&
        t.category.toLowerCase().includes('iuran') &&
        t.date.slice(0, 4) === rekapYear &&
        t.date.slice(5, 7) === rekapMonth
    );
    return {
      member: m,
      paidTx: duesTx,
      paid: !!duesTx,
    };
  });

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

  const handleExportPdf = () => {
    const monthLabel = MONTH_NAMES_ID[Number(rekapMonth) - 1];
    const paidCount = rekapList.filter((item) => item.paid).length;
    const totalDuesCollected = rekapList
      .filter((item) => item.paid)
      .reduce((sum, item) => sum + (item.paidTx?.amount || item.member.monthlyDues), 0);

    const content = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #0f172a;">Laporan Pelunasan Iuran Wajib Anggota</h3>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Periode: ${monthLabel} ${rekapYear}</p>

        <div style="display: flex; gap: 12px; margin-bottom: 16px; font-size: 11px;">
          <div style="flex: 1; padding: 8px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <div style="color: #166534; font-size: 10px;">Status Pelunasan:</div>
            <div style="font-weight: bold; font-family: monospace; color: #15803d; font-size: 13px;">${formatNumber(paidCount)} / ${formatNumber(rekapList.length)} Anggota (${rekapList.length ? Math.round((paidCount / rekapList.length) * 100) : 0}%)</div>
          </div>
          <div style="flex: 1; padding: 8px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
            <div style="color: #475569; font-size: 10px;">Total Iuran Terkumpul:</div>
            <div style="font-weight: bold; font-family: monospace; color: #0284c7; font-size: 13px;">${formatRupiah(totalDuesCollected)}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px 6px;">No</th>
              <th style="padding: 8px 6px;">Nama Anggota</th>
              <th style="padding: 8px 6px;">No. HP</th>
              <th style="padding: 8px 6px; text-align: right;">Tarif Iuran</th>
              <th style="padding: 8px 6px; text-align: center;">Status</th>
              <th style="padding: 8px 6px; text-align: right;">Tgl Bayar</th>
            </tr>
          </thead>
          <tbody>
            ${rekapList
              .map(
                (item, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">${idx + 1}</td>
                <td style="padding: 6px; font-weight: 600;">${item.member.name}</td>
                <td style="padding: 6px; font-family: monospace;">${item.member.phone || '-'}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">${formatRupiah(item.member.monthlyDues)}</td>
                <td style="padding: 6px; text-align: center; font-weight: bold; color: ${item.paid ? '#15803d' : '#be123c'};">${item.paid ? 'LUNAS' : 'BELUM'}</td>
                <td style="padding: 6px; text-align: right; font-family: monospace;">${item.paidTx ? formatDateId(item.paidTx.date) : '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    printSectionToPdf(`Rekap Iuran ${monthLabel} ${rekapYear}`, `Periode ${monthLabel} ${rekapYear}`, content);
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

              <div className="sm:col-span-2 lg:col-span-1">
                <CurrencyAmountInput
                  label="Nominal Pembayaran (Rp)"
                  value={amount}
                  onChange={setAmount}
                  required
                  showTerbilang={true}
                  showCornerAmount={true}
                  showQuickChips={false}
                  placeholder="0"
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

          <div className="flex flex-wrap items-center gap-2 text-xs">
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
            {permissions?.canExportReports && (
              <button
                onClick={handleExportPdf}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
                title="Cetak & Export Rekap Iuran ke format PDF"
              >
                <Printer size={13} />
                <span>Export PDF</span>
              </button>
            )}
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
