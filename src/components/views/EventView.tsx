import React, { useState } from 'react';
import { CalendarDays, Plus, Trash2, MapPin, Calendar, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { AppState, AppEvent, UserRolePermission } from '../../types';
import { formatRupiah, formatNumber, formatDateId, generateUid } from '../../utils/formatters';

interface EventViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  onAddEvent: (event: AppEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventView: React.FC<EventViewProps> = ({
  state,
  currentRole,
  onAddEvent,
  onDeleteEvent,
}) => {
  const permissions = currentRole?.permissions;
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !date) return;

    const newEvt: AppEvent = {
      id: generateUid(),
      name: cleanName,
      date,
      location: location.trim(),
    };

    onAddEvent(newEvt);
    setName('');
    setLocation('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Tambah Event Form */}
      {permissions?.canManageEvents && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={17} className="text-emerald-500" />
              <span>Tambah Kegiatan Turnamen &amp; Kejuaraan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola anggaran dan pantau realisasi surplus/defisit tiap event.
            </p>
          </div>

          <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kejuaraan / Turnamen
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Piala Wali Kota Batu 2026..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi / Venue Kegiatan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: GOR Ganesha Kota Batu..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={15} />
                <span>Simpan Event</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Event Cards with Income, Expense & Net Stats */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Daftar Turnamen &amp; Realisasi Anggaran ({formatNumber(state.events.length)})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.events.map((ev) => {
            const evTxs = state.transactions.filter((t) => t.eventId === ev.id);
            const inc = evTxs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const exp = evTxs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            const net = inc - exp;

            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {ev.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-emerald-500" />
                          <span>{formatDateId(ev.date)}</span>
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-sky-500" />
                            <span>{ev.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {permissions?.canManageEvents && (
                      <button
                        type="button"
                        disabled={evTxs.length > 0}
                        onClick={() => {
                          if (confirm(`Hapus event "${ev.name}"?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        title={
                          evTxs.length > 0
                            ? 'Tidak bisa dihapus karena sudah ada transaksi kas yang terkait'
                            : 'Hapus event ini'
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Financial stats of this event */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Pemasukan</div>
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatRupiah(inc)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Pengeluaran</div>
                      <div className="font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        {formatRupiah(exp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Surplus/Defisit</div>
                      <div
                        className={`font-mono font-bold mt-0.5 ${
                          net >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatRupiah(net)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10.5px] text-slate-400 border-t border-slate-100 dark:border-slate-700/50 flex justify-between">
                  <span>{evTxs.length} transaksi terkait</span>
                  <span>{net >= 0 ? 'Surplus Dana Event' : 'Defisit Anggaran Event'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
