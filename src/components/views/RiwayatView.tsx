import React, { useState } from 'react';
import { History, Filter, Search, RotateCcw } from 'lucide-react';
import { AppState, ActivityLog, UserRolePermission } from '../../types';
import { formatDateTimeId } from '../../utils/formatters';

interface RiwayatViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({ state, currentRole }) => {
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = state.activityLogs
    .filter((log) => {
      if (filterEntity !== 'all' && log.entity !== filterEntity) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.desc.toLowerCase().includes(q) ||
          log.email.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .slice(0, 300); // Max 300 latest activities as required

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'Tambah':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Hapus':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Ubah':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Riwayat Aktivitas Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History size={17} className="text-emerald-500" />
              <span>Riwayat Aktivitas &amp; Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jejak digital penambahan, modifikasi, dan penghapusan data di seluruh modul sistem (maks. 300 entri).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Jenis Data:</span>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                <option value="all">Semua Jenis Data</option>
                <option value="Transaksi">Transaksi</option>
                <option value="Akun">Akun</option>
                <option value="Anggota">Anggota</option>
                <option value="Kategori">Kategori</option>
                <option value="Event">Event</option>
                <option value="Pengguna">Pengguna</option>
                <option value="Peran">Peran</option>
                <option value="Database">Database & Sync</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari log keterangan..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 w-44 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Waktu Kejadian</th>
                <th className="py-2.5 px-3 font-semibold">Pengguna (Email)</th>
                <th className="py-2.5 px-3 font-semibold">Jenis Data</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
                <th className="py-2.5 px-3 font-semibold">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Belum ada riwayat aktivitas yang tercatat untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDateTimeId(log.time)}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {log.email}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                      {log.entity}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {log.desc}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
