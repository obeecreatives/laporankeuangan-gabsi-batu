import React, { useState } from 'react';
import { Users, Plus, Trash2, Search, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { AppState, Member, MemberStatus, UserRolePermission } from '../../types';
import { formatRupiah, generateUid } from '../../utils/formatters';

interface AnggotaViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  onAddMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const AnggotaView: React.FC<AnggotaViewProps> = ({
  state,
  currentRole,
  onAddMember,
  onDeleteMember,
  onToggleStatus,
}) => {
  const permissions = currentRole?.permissions;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Aktif');
  const [monthlyDues, setMonthlyDues] = useState<number | ''>('');
  const [search, setSearch] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const newMem: Member = {
      id: generateUid(),
      name: cleanName,
      phone: phone.trim(),
      status,
      monthlyDues: Number(monthlyDues) || 0,
    };

    onAddMember(newMem);
    setName('');
    setPhone('');
    setStatus('Aktif');
    setMonthlyDues('');
  };

  const filteredMembers = state.members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.status.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Tambah Anggota Form */}
      {permissions?.canManageMembers && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={17} className="text-emerald-500" />
              <span>Tambah Anggota &amp; Atlet Bridge</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registrasi anggota klub dan nominal iuran bulanan wajib.
            </p>
          </div>

          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarif Iuran Bulanan (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyDues}
                onChange={(e) =>
                  setMonthlyDues(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4 flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={15} />
                <span>Simpan Anggota</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Anggota */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Direktori Anggota ({filteredMembers.length} Orang)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar seluruh pengurus, atlet, dan anggota Bridge Kota Batu.
            </p>
          </div>

          <div className="relative text-xs w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau no HP..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Nama Anggota</th>
                <th className="py-2.5 px-3 font-semibold">No. HP / WA</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Iuran Bulanan</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada anggota ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isUsed = state.transactions.some((t) => t.memberId === m.id);
                  const isAktif = m.status === 'Aktif';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {m.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => permissions?.canManageMembers && onToggleStatus(m.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            isAktif
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isAktif ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          <span>{m.status}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(m.monthlyDues)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {permissions?.canManageMembers && (
                          <button
                            type="button"
                            disabled={isUsed}
                            onClick={() => {
                              if (confirm(`Hapus data anggota "${m.name}"?`)) {
                                onDeleteMember(m.id);
                              }
                            }}
                            title={
                              isUsed
                                ? 'Tidak bisa dihapus karena sudah memiliki riwayat transaksi iuran'
                                : 'Hapus anggota'
                            }
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
