import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  History,
  Trash2,
  Edit2,
  X,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AppState, Transaction, TransactionType, UserRolePermission, TransactionHistory } from '../../types';
import { formatRupiah, formatDateId, MONTH_NAMES_ID, generateUid, exportToCsvFile } from '../../utils/formatters';

interface TransaksiViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  userEmail: string;
  onSaveTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  getAccountBalance: (accountId: string) => number;
  txHistories: TransactionHistory[];
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  state,
  currentRole,
  userEmail,
  onSaveTransaction,
  onDeleteTransaction,
  getAccountBalance,
  txHistories,
}) => {
  const permissions = currentRole?.permissions;
  const now = new Date();
  const curYear = String(now.getFullYear());

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [type, setType] = useState<TransactionType>('income');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id || '');
  const [category, setCategory] = useState(state.categories.income[0] || '');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [memberId, setMemberId] = useState('');
  const [eventId, setEventId] = useState('');

  // Filter states
  const [selectedYear, setSelectedYear] = useState(curYear);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // History modal state
  const [activeHistoryTxId, setActiveHistoryTxId] = useState<string | null>(null);

  // Available years from transactions
  const availableYears = Array.from(
    new Set([curYear, ...state.transactions.map((t) => t.date.slice(0, 4))])
  ).sort().reverse();

  // Handle Type Change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(state.categories.income[0] || '');
    } else if (newType === 'expense') {
      setCategory(state.categories.expense[0] || '');
    } else {
      setCategory('');
    }
  };

  // Start edit
  const handleStartEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setDate(tx.date);
    setType(tx.type);
    setAccountId(tx.accountId);
    setToAccountId(tx.toAccountId || state.accounts.find((a) => a.id !== tx.accountId)?.id || '');
    setCategory(tx.category);
    setDesc(tx.desc);
    setAmount(tx.amount);
    setMemberId(tx.memberId || '');
    setEventId(tx.eventId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setDate(now.toISOString().slice(0, 10));
    setType('income');
    setCategory(state.categories.income[0] || '');
    setMemberId('');
    setEventId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Nominal harus lebih dari 0.');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      alert('Akun asal dan akun tujuan transfer tidak boleh sama.');
      return;
    }

    const txPayload: Transaction = {
      id: editingId || generateUid(),
      date,
      type,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : '',
      category: type === 'transfer' ? '' : category,
      desc: desc.trim(),
      amount: Number(amount),
      memberId: type === 'transfer' ? '' : memberId,
      eventId: type === 'transfer' ? '' : eventId,
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
    };

    onSaveTransaction(txPayload);
    handleCancelEdit();
  };

  // Filtered transactions
  const filteredTransactions = state.transactions
    .filter((t) => {
      if (selectedYear !== 'all' && t.date.slice(0, 4) !== selectedYear) return false;
      if (selectedMonth !== 'all' && t.date.slice(5, 7) !== selectedMonth) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const accName = state.accounts.find((a) => a.id === t.accountId)?.name.toLowerCase() || '';
        const toAccName = state.accounts.find((a) => a.id === t.toAccountId)?.name.toLowerCase() || '';
        const memName = state.members.find((m) => m.id === t.memberId)?.name.toLowerCase() || '';
        const evtName = state.events.find((e) => e.id === t.eventId)?.name.toLowerCase() || '';
        return (
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          accName.includes(q) ||
          toAccName.includes(q) ||
          memName.includes(q) ||
          evtName.includes(q) ||
          t.date.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedList = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Jenis',
      'Akun Asal',
      'Akun Tujuan',
      'Kategori',
      'Deskripsi / Keterangan',
      'Nominal (Rp)',
      'Terkait Anggota',
      'Terkait Event',
      'Dicatat Oleh',
    ];

    const rows = filteredTransactions.map((t) => {
      const acc = state.accounts.find((a) => a.id === t.accountId)?.name || '—';
      const toAcc = state.accounts.find((a) => a.id === t.toAccountId)?.name || '—';
      const mem = state.members.find((m) => m.id === t.memberId)?.name || '';
      const evt = state.events.find((e) => e.id === t.eventId)?.name || '';
      const typeLabel = t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer';
      return [
        t.id,
        t.date,
        typeLabel,
        acc,
        toAcc,
        t.category,
        t.desc,
        t.amount,
        mem,
        evt,
        t.createdBy,
      ];
    });

    const monthLabel = selectedMonth === 'all' ? 'Semua_Bulan' : MONTH_NAMES_ID[Number(selectedMonth) - 1];
    exportToCsvFile(`GABSI_Batu_Transaksi_${monthLabel}_${selectedYear}`, headers, rows);
  };

  const accountMap = new Map(state.accounts.map((a) => [a.id, a.name]));
  const memberMap = new Map(state.members.map((m) => [m.id, m.name]));
  const eventMap = new Map(state.events.map((e) => [e.id, e.name]));

  // Selected Tx History entries
  const currentTxHistories = txHistories.filter(
    (h) => h.transactionId === activeHistoryTxId
  );

  return (
    <div className="space-y-6">
      {/* Form Input Transaksi Card */}
      {permissions?.canCreateTransaction && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt size={17} className="text-emerald-500" />
              <span>{editingId ? 'Edit Catatan Transaksi' : 'Tambah Transaksi Kas Baru'}</span>
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Top Form Row: Date, Type, Account, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Transaksi
                </label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="income">🟢 Pemasukan Kas</option>
                  <option value="expense">🔴 Pengeluaran Kas</option>
                  <option value="transfer">🔄 Transfer Antar Akun</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'transfer' ? 'Dari Akun Asal' : 'Akun Kas / Bank'}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {state.accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(getAccountBalance(acc.id))})
                    </option>
                  ))}
                </select>
              </div>

              {type === 'transfer' ? (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ke Akun Tujuan
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {state.accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pos / Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {(type === 'income' ? state.categories.income : state.categories.expense).map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Second Form Row: Relation to Member or Event */}
            {type !== 'transfer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Terkait Anggota (Opsional - misal iuran)
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">— Tidak Terkait Anggota Spesifik —</option>
                    {state.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Terkait Event / Turnamen (Opsional)
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">— Tidak Terkait Turnamen Tertentu —</option>
                    {state.events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Third Row: Deskripsi & Nominal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Catatan Transaksi
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Sewa GOR latihan minggu 2, Konsumsi rapat KONI..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={15} />
                <span>{editingId ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Transactions List Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        {/* Filter Controls Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                <option value="all">Semua Bulan</option>
                {MONTH_NAMES_ID.map((m, idx) => (
                  <option key={m} value={String(idx + 1).padStart(2, '0')}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Instant Search */}
            <div className="relative text-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari deskripsi, kategori, akun..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 w-48 sm:w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            </div>
          </div>

          {/* Export Button */}
          {permissions?.canExportReports && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              title="Unduh data transaksi ke format CSV / Excel"
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV / Excel</span>
            </button>
          )}
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Jenis</th>
                <th className="py-2.5 px-3 font-semibold">Akun</th>
                <th className="py-2.5 px-3 font-semibold">Kategori</th>
                <th className="py-2.5 px-3 font-semibold">Deskripsi / Terkait</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nominal</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi ditemukan pada periode filter ini.
                  </td>
                </tr>
              ) : (
                paginatedList.map((tx) => {
                  const isTransfer = tx.type === 'transfer';
                  const isIncome = tx.type === 'income';
                  const memName = tx.memberId ? memberMap.get(tx.memberId) : null;
                  const evtName = tx.eventId ? eventMap.get(tx.eventId) : null;
                  const hasHistory = txHistories.some((h) => h.transactionId === tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatDateId(tx.date)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
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
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {isTransfer ? (
                          <div className="flex items-center gap-1">
                            <span>{accountMap.get(tx.accountId) || '—'}</span>
                            <ArrowRightLeft size={11} className="text-slate-400" />
                            <span>{accountMap.get(tx.toAccountId || '') || '—'}</span>
                          </div>
                        ) : (
                          accountMap.get(tx.accountId) || '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-semibold">
                        {tx.category || 'Transfer Antar Rekening'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div>{tx.desc || '—'}</div>
                        {(memName || evtName) && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                            {memName && <span className="text-emerald-600 dark:text-emerald-400">👤 {memName}</span>}
                            {evtName && <span className="text-amber-600 dark:text-amber-400">🏆 {evtName}</span>}
                          </div>
                        )}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                          isTransfer
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {permissions?.canViewTxHistory && hasHistory && (
                            <button
                              onClick={() => setActiveHistoryTxId(tx.id)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                              title="Lihat riwayat snapshot perubahan transaksi"
                            >
                              <History size={14} />
                            </button>
                          )}
                          {permissions?.canEditTransaction && (
                            <button
                              onClick={() => handleStartEdit(tx)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Edit transaksi ini"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {permissions?.canDeleteTransaction && (
                            <button
                              onClick={() => {
                                if (confirm('Yakin ingin menghapus transaksi ini?')) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Hapus transaksi"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredTransactions.length)} dari{' '}
              {filteredTransactions.length} transaksi
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Snapshot Modal */}
      {activeHistoryTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setActiveHistoryTxId(null)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveHistoryTxId(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Riwayat Audit Perubahan Transaksi
              </h3>
            </div>

            {currentTxHistories.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                Belum ada versi lama sebelum transaksi ini diedit.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {currentTxHistories.map((h, i) => (
                  <div
                    key={h.id || i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>Diedit oleh: {h.editedBy}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {h.editedAt}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <div>Snapshot Versi Lama:</div>
                      <div className="font-mono mt-1 space-y-0.5 text-[11px] bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                        <div>Tanggal: {h.oldSnapshot.date}</div>
                        <div>Jenis: {h.oldSnapshot.type}</div>
                        <div>Deskripsi: {h.oldSnapshot.desc}</div>
                        <div>Nominal: {formatRupiah(h.oldSnapshot.amount)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
