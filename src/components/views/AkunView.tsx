import React, { useState } from 'react';
import { Wallet, Plus, Trash2, AlertTriangle, Sparkles, Building2, Landmark, Smartphone } from 'lucide-react';
import { AppState, Account, AccountType, UserRolePermission } from '../../types';
import { formatRupiah, formatNumber, generateUid } from '../../utils/formatters';
import { CurrencyAmountInput } from '../CurrencyAmountInput';

interface AkunViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  onAddAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
  getAccountBalance: (accountId: string) => number;
}

const REF_ACCOUNTS: { name: string; type: AccountType; initialBalance: number }[] = [
  { name: 'Kas Tunai Bendahara', type: 'Kas', initialBalance: 0 },
  { name: 'Rekening Bank Jatim Cabang Batu', type: 'Bank', initialBalance: 0 },
  { name: 'Kas Digital / QRIS GABSI', type: 'E-Wallet', initialBalance: 0 },
];

export const AkunView: React.FC<AkunViewProps> = ({
  state,
  currentRole,
  onAddAccount,
  onDeleteAccount,
  getAccountBalance,
}) => {
  const permissions = currentRole?.permissions;
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Kas');
  const [initialBalance, setInitialBalance] = useState<number | ''>('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    if (state.accounts.some((a) => a.name.toLowerCase() === cleanName.toLowerCase())) {
      alert(`Akun kas/bank dengan nama "${cleanName}" sudah terdaftar.`);
      return;
    }

    const newAcc: Account = {
      id: generateUid(),
      name: cleanName,
      type,
      initialBalance: Number(initialBalance) || 0,
    };

    onAddAccount(newAcc);
    setName('');
    setInitialBalance('');
    setType('Kas');
  };

  const handleLoadPresets = () => {
    let added = 0;
    REF_ACCOUNTS.forEach((preset) => {
      if (!state.accounts.some((a) => a.name.toLowerCase() === preset.name.toLowerCase())) {
        onAddAccount({
          id: generateUid(),
          name: preset.name,
          type: preset.type,
          initialBalance: preset.initialBalance,
        });
        added++;
      }
    });
    alert(added > 0 ? `${added} akun referensi berhasil ditambahkan!` : 'Semua akun referensi sudah ada di daftar.');
  };

  const getAccountIcon = (t: AccountType) => {
    switch (t) {
      case 'Bank':
        return <Landmark size={18} className="text-sky-500" />;
      case 'E-Wallet':
        return <Smartphone size={18} className="text-indigo-500" />;
      default:
        return <Wallet size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tambah Akun Form */}
      {permissions?.canManageAccounts && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet size={17} className="text-emerald-500" />
                <span>Tambah Akun Kas atau Rekening Bank</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan saldo awal dan monitoring buku kas organisasi.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadPresets}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles size={14} />
              <span>Muat Referensi Akun Umum</span>
            </button>
          </div>

          <form onSubmit={handleAddAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Akun
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kas Kecil Bendahara, Bank Jatim..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Akun
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
              >
                <option value="Kas">Kas Tunai</option>
                <option value="Bank">Rekening Bank</option>
                <option value="E-Wallet">E-Wallet / QRIS</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <CurrencyAmountInput
                label="Saldo Awal (Rp)"
                value={initialBalance}
                onChange={setInitialBalance}
                showTerbilang={true}
                showCornerAmount={true}
                showQuickChips={false}
                placeholder="0"
              />
            </div>

            <div className="sm:col-span-4 flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={15} />
                <span>Simpan Akun</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Akun Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.accounts.map((acc) => {
          const bal = getAccountBalance(acc.id);
          const isNeg = bal < 0;
          const isUsed = state.transactions.some(
            (t) => t.accountId === acc.id || t.toAccountId === acc.id
          );

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-800/90 border shadow-sm transition relative flex flex-col justify-between ${
                isNeg
                  ? 'border-rose-400 dark:border-rose-800'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {acc.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">{acc.type}</span>
                    </div>
                  </div>

                  {permissions?.canManageAccounts && (
                    <button
                      type="button"
                      disabled={isUsed}
                      onClick={() => {
                        if (confirm(`Hapus akun "${acc.name}"?`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      title={
                        isUsed
                          ? 'Tidak dapat dihapus karena sudah memiliki riwayat mutasi transaksi'
                          : 'Hapus akun ini'
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70">
                  <div className="text-[11px] text-slate-400 font-medium">Saldo Saat Ini</div>
                  <div
                    className={`text-xl font-mono font-bold mt-0.5 ${
                      isNeg ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatRupiah(bal)}
                  </div>
                  {isNeg && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                      <AlertTriangle size={13} />
                      <span>Saldo Minus — Segera Lakukan Mutasi Kas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Saldo Awal:</span>
                <span>{formatRupiah(acc.initialBalance)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
