import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  KeyRound,
  Layers,
  UserCog,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AppState, UserAccount, UserRolePermission } from '../../types';
import { getDefaultPinForRole, DEFAULT_PIN_PRIVILEGED, DEFAULT_PIN_GENERAL } from '../../services/storage';

interface PenggunaViewProps {
  state: AppState;
  currentRole: UserRolePermission | undefined;
  currentUserEmail: string;
  onAddUser: (user: UserAccount) => void;
  onDeleteUser: (email: string) => void;
  onResetPin: (email: string) => void;
  onUpdateUserRole: (email: string, newRoleId: string) => void;
  onOpenRoleSettings: () => void;
}

export const PenggunaView: React.FC<PenggunaViewProps> = ({
  state,
  currentRole,
  currentUserEmail,
  onAddUser,
  onDeleteUser,
  onResetPin,
  onUpdateUserRole,
  onOpenRoleSettings,
}) => {
  const permissions = currentRole?.permissions;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState(state.roles[2]?.id || 'admin');

  // Modal edit role state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedNewRoleId, setSelectedNewRoleId] = useState<string>('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName) return;

    if (state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      alert(`Pengguna dengan email "${cleanEmail}" sudah terdaftar.`);
      return;
    }

    const assignedDefaultPin = getDefaultPinForRole(roleId);

    const newUser: UserAccount = {
      email: cleanEmail,
      name: cleanName,
      roleId,
      pin: assignedDefaultPin,
      isDefaultPin: true,
      createdAt: new Date().toISOString(),
    };

    onAddUser(newUser);
    setEmail('');
    setName('');
    alert(
      `Pengguna ${cleanName} berhasil ditambahkan dengan PIN standar: ${assignedDefaultPin}`
    );
  };

  const openEditRoleModal = (user: UserAccount) => {
    setEditingUser(user);
    setSelectedNewRoleId(user.roleId);
  };

  const handleSaveRoleChange = () => {
    if (!editingUser || !selectedNewRoleId) return;
    onUpdateUserRole(editingUser.email, selectedNewRoleId);
    setEditingUser(null);
  };

  const roleMap = new Map(state.roles.map((r) => [r.id, r.name]));

  return (
    <div className="space-y-6">
      {/* Tambah Pengguna Form */}
      {permissions?.canManageUsers && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-500" />
                <span>Tambah Pengguna Aplikasi Baru</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PIN standar otomatis: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{DEFAULT_PIN_PRIVILEGED}</strong> (Developer &amp; Bendahara Utama) atau <strong className="text-slate-700 dark:text-slate-300 font-mono">{DEFAULT_PIN_GENERAL}</strong> (Admin &amp; Pengurus).
              </p>
            </div>

            {permissions?.canManageRoles && (
              <button
                type="button"
                onClick={onOpenRoleSettings}
                className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Layers size={14} />
                <span>Atur Matriks Hak Akses Peran</span>
              </button>
            )}
          </div>

          <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Pengurus
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gabsibatu.org atau Gmail..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap / Jabatan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso (Sekretariat)..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tugaskan Peran (Role)
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
              >
                {state.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={15} />
                <span>Simpan Pengguna</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Pengguna Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Pengguna Terdaftar ({state.users.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seluruh akun yang memiliki hak akses login dengan email dan PIN. Anda dapat mengedit peran atau mereset PIN sewaktu-waktu.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Nama Pengguna</th>
                <th className="py-2.5 px-3 font-semibold">Email</th>
                <th className="py-2.5 px-3 font-semibold">Peran (Role)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status PIN</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.users.map((u) => {
                const isMe = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                const roleName = roleMap.get(u.roleId) || u.roleId;
                const standardPinForThisRole = getDefaultPinForRole(u.roleId);

                return (
                  <tr
                    key={u.email}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      <span>{u.name}</span>
                      {isMe && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                          Anda (Sesi Aktif)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                          {roleName}
                        </span>
                        {permissions?.canManageRoles && (
                          <button
                            type="button"
                            onClick={() => openEditRoleModal(u)}
                            className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                            title="Edit Peran Pengguna"
                          >
                            <UserCog size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.isDefaultPin
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {u.isDefaultPin
                          ? `PIN Standar (${standardPinForThisRole})`
                          : 'PIN Kustom'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Edit Peran */}
                        {permissions?.canManageRoles && (
                          <button
                            type="button"
                            onClick={() => openEditRoleModal(u)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition flex items-center gap-1 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800/60"
                            title="Ubah peran pengguna ini"
                          >
                            <UserCog size={13} />
                            <span>Edit Peran</span>
                          </button>
                        )}

                        {/* Tombol Reset PIN */}
                        {permissions?.canManageUsers && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Reset PIN untuk ${u.email} kembali ke PIN standar (${standardPinForThisRole}) sesuai perannya?`
                                )
                              ) {
                                onResetPin(u.email);
                              }
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                            title={`Reset PIN ke standar (${standardPinForThisRole})`}
                          >
                            <KeyRound size={14} />
                          </button>
                        )}

                        {/* Tombol Hapus Pengguna */}
                        {permissions?.canManageUsers && !isMe && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus akses pengguna "${u.email}"?`)) {
                                onDeleteUser(u.email);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Hapus pengguna ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog: Edit Peran Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 z-10 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <UserCog size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  Ubah Peran (Role) Pengguna
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                  {editingUser.name} ({editingUser.email})
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Peran Baru:
                </label>
                <div className="space-y-2">
                  {state.roles.map((r) => {
                    const isSelected = selectedNewRoleId === r.id;
                    return (
                      <label
                        key={r.id}
                        onClick={() => setSelectedNewRoleId(r.id)}
                        className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div>{r.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {r.description}
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-indigo-600 mt-0.5" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-indigo-500" />
                <span>
                  Perubahan peran akan langsung memutakhirkan hak akses fitur, tombol, dan modul yang boleh diakses oleh pengguna ini.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoleChange}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Check size={14} />
                  <span>Terapkan Peran Baru</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
