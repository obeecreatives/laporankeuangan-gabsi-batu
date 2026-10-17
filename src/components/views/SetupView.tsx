import React, { useState } from 'react';
import { Sliders, Plus, Trash2, Sparkles, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { AppState, UserRolePermission } from '../../types';

interface SetupViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  onUpdateCategories: (categories: { income: string[]; expense: string[] }) => void;
  onPurgeDummyData?: () => void;
}

const REF_INCOME = [
  'Iuran Anggota',
  'Iuran Turnamen/Event',
  'Sponsorship',
  'Donasi',
  'Bantuan Hibah KONI Batu',
  'Pemasukan Lain-lain',
];

const REF_EXPENSE = [
  'Sewa Tempat & GOR',
  'Konsumsi Latihan & Rapat',
  'Peralatan Bridge (Kartu, Bidding Box)',
  'Hadiah & Uang Pembinaan',
  'Administrasi & Afiliasi GABSI Jatim',
  'Transport & Akomodasi Atlet',
  'Dokumentasi & Publikasi',
  'Pengeluaran Lain-lain',
];

export const SetupView: React.FC<SetupViewProps> = ({
  state,
  currentRole,
  onUpdateCategories,
  onPurgeDummyData,
}) => {
  const [newIncome, setNewIncome] = useState('');
  const [newExpense, setNewExpense] = useState('');

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newIncome.trim();
    if (!val) return;
    if (state.categories.income.includes(val)) {
      alert('Kategori sumber pemasukan ini sudah ada.');
      return;
    }
    onUpdateCategories({
      ...state.categories,
      income: [...state.categories.income, val],
    });
    setNewIncome('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newExpense.trim();
    if (!val) return;
    if (state.categories.expense.includes(val)) {
      alert('Kategori pengeluaran ini sudah ada.');
      return;
    }
    onUpdateCategories({
      ...state.categories,
      expense: [...state.categories.expense, val],
    });
    setNewExpense('');
  };

  const handleDeleteIncome = (cat: string) => {
    const isUsed = state.transactions.some((t) => t.type === 'income' && t.category === cat);
    if (isUsed && !confirm(`Kategori "${cat}" sudah digunakan di beberapa transaksi. Tetap hapus dari pilihan?`)) {
      return;
    }
    onUpdateCategories({
      ...state.categories,
      income: state.categories.income.filter((c) => c !== cat),
    });
  };

  const handleDeleteExpense = (cat: string) => {
    const isUsed = state.transactions.some((t) => t.type === 'expense' && t.category === cat);
    if (isUsed && !confirm(`Kategori "${cat}" sudah digunakan di beberapa transaksi. Tetap hapus dari pilihan?`)) {
      return;
    }
    onUpdateCategories({
      ...state.categories,
      expense: state.categories.expense.filter((c) => c !== cat),
    });
  };

  const handleLoadIncomePresets = () => {
    const combined = Array.from(new Set([...state.categories.income, ...REF_INCOME]));
    onUpdateCategories({ ...state.categories, income: combined });
    alert('Referensi pos pemasukan umum berhasil dimuat!');
  };

  const handleLoadExpensePresets = () => {
    const combined = Array.from(new Set([...state.categories.expense, ...REF_EXPENSE]));
    onUpdateCategories({ ...state.categories, expense: combined });
    alert('Referensi pos pengeluaran umum berhasil dimuat!');
  };

  return (
    <div className="space-y-6">
      {/* Sumber Pemasukan Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Sumber Pemasukan Kas</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kategori pos penerimaan dana organisasi (iuran, hibah, donasi, dsb).
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadIncomePresets}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles size={14} />
            <span>Muat Referensi Umum</span>
          </button>
        </div>

        <form onSubmit={handleAddIncome} className="flex gap-2">
          <input
            type="text"
            value={newIncome}
            onChange={(e) => setNewIncome(e.target.value)}
            placeholder="Tambah pos pemasukan baru..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {state.categories.income.map((cat) => (
            <div
              key={cat}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs font-medium"
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={() => handleDeleteIncome(cat)}
                className="text-emerald-700 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400 transition"
                title="Hapus pos ini"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori Pengeluaran Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Kategori Pengeluaran Operasional</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pos alokasi pengeluaran kas (sewa gedung, konsumsi, perlengkapan, dsb).
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadExpensePresets}
            className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles size={14} />
            <span>Muat Referensi Umum</span>
          </button>
        </div>

        <form onSubmit={handleAddExpense} className="flex gap-2">
          <input
            type="text"
            value={newExpense}
            onChange={(e) => setNewExpense(e.target.value)}
            placeholder="Tambah kategori pengeluaran baru..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 transition"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {state.categories.expense.map((cat) => (
            <div
              key={cat}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 text-xs font-medium"
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={() => handleDeleteExpense(cat)}
                className="text-rose-700 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 transition"
                title="Hapus pos ini"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pembersihan Data Pengembangan (Clean Slate) */}
      {onPurgeDummyData && (
        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                <span>Pembersihan Data Pengembangan (Clean Slate)</span>
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80 max-w-2xl leading-relaxed">
                Hapus seluruh transaksi dummy, hapus log aktivitas uji coba, dan reset saldo awal seluruh akun kas/bank kembali ke <strong>Rp 0</strong> untuk persiapan produksi atau deploy ke Vercel.
              </p>
            </div>
            <button
              type="button"
              onClick={onPurgeDummyData}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition whitespace-nowrap"
            >
              <RotateCcw size={14} />
              <span>Bersihkan Data Dummy (Reset ke 0)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
