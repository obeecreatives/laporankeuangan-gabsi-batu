import React, { useState } from 'react';
import { X, Shield, Plus, Trash2, Edit3, Check, Save, AlertCircle } from 'lucide-react';
import { UserRolePermission } from '../types';

interface RoleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: UserRolePermission[];
  onSaveRoles: (updatedRoles: UserRolePermission[]) => void;
}

const PERMISSION_CONFIG: {
  key: keyof UserRolePermission['permissions'];
  label: string;
  desc: string;
  category: 'Akses Utama' | 'Transaksi & Iuran' | 'Laporan & Ekspor' | 'Pengaturan & Sistem';
}[] = [
  {
    key: 'canViewDashboard',
    label: 'Lihat Beranda & Ringkasan',
    desc: 'Boleh melihat saldo umum, statistik bulanan, dan transaksi terbaru',
    category: 'Akses Utama',
  },
  {
    key: 'canManageSetup',
    label: 'Setup Kategori',
    desc: 'Boleh menambah, mengedit, dan menghapus kategori pemasukan & pengeluaran',
    category: 'Akses Utama',
  },
  {
    key: 'canManageAccounts',
    label: 'Kelola Akun Kas & Bank',
    desc: 'Boleh menambah rekening kas/bank baru dan mengatur saldo awal',
    category: 'Akses Utama',
  },
  {
    key: 'canManageMembers',
    label: 'Kelola Data Anggota',
    desc: 'Boleh menambah anggota baru dan mengatur tarif iuran bulanan',
    category: 'Akses Utama',
  },
  {
    key: 'canCreateTransaction',
    label: 'Catat Transaksi Baru',
    desc: 'Boleh menginput pemasukan, pengeluaran, dan transfer antar akun',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canEditTransaction',
    label: 'Edit Transaksi Tersimpan',
    desc: 'Boleh mengubah rincian transaksi yang pernah dicatat sebelumnya',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canDeleteTransaction',
    label: 'Hapus Transaksi',
    desc: 'Boleh menghapus record transaksi kas yang salah',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canViewTxHistory',
    label: 'Lihat Riwayat Perubahan Transaksi',
    desc: 'Boleh memeriksa jejak audit versi lama sebelum transaksi diedit',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canManageDues',
    label: 'Kelola Iuran Bulanan',
    desc: 'Boleh mencatat setoran iuran dan memeriksa rekap pelunasan',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canManageEvents',
    label: 'Kelola Event & Turnamen',
    desc: 'Boleh menambah kegiatan turnamen dan memantau laba/rugi event',
    category: 'Transaksi & Iuran',
  },
  {
    key: 'canViewReports',
    label: 'Lihat Laporan Keuangan',
    desc: 'Akses ke tab Rekap Tahunan, Rincian, Surplus/Defisit, Neraca, dan Arus Kas',
    category: 'Laporan & Ekspor',
  },
  {
    key: 'canExportReports',
    label: 'Export Dokumen (PDF / Excel)',
    desc: 'Boleh mengunduh rekap transaksi ke CSV atau mencetak PDF resmi LPJ',
    category: 'Laporan & Ekspor',
  },
  {
    key: 'canManageUsers',
    label: 'Kelola Akun Pengguna',
    desc: 'Boleh menambah email pengurus baru dan mereset PIN akses',
    category: 'Pengaturan & Sistem',
  },
  {
    key: 'canManageRoles',
    label: 'Konfigurasi Hak Akses & Peran (RBAC)',
    desc: 'Boleh menambah, mengedit, dan mengubah checklist izin peran',
    category: 'Pengaturan & Sistem',
  },
  {
    key: 'canViewActivityLogs',
    label: 'Lihat Riwayat Aktivitas Audit',
    desc: 'Boleh memantau seluruh catatan tambah/ubah/hapus data di sistem',
    category: 'Pengaturan & Sistem',
  },
  {
    key: 'canAccessGasCenter',
    label: 'Akses Headless GAS Center',
    desc: 'Boleh mengubah endpoint URL Google Apps Script dan menyalin skrip backend',
    category: 'Pengaturan & Sistem',
  },
];

export const RoleSettingsModal: React.FC<RoleSettingsModalProps> = ({
  isOpen,
  onClose,
  roles,
  onSaveRoles,
}) => {
  const [roleList, setRoleList] = useState<UserRolePermission[]>(roles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'developer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDesc, setTempDesc] = useState('');

  if (!isOpen) return null;

  const activeRole = roleList.find((r) => r.id === selectedRoleId) || roleList[0];

  const handleTogglePermission = (key: keyof UserRolePermission['permissions']) => {
    if (!activeRole) return;
    const updated = roleList.map((r) => {
      if (r.id === activeRole.id) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [key]: !r.permissions[key],
          },
        };
      }
      return r;
    });
    setRoleList(updated);
  };

  const handleAddNewRole = () => {
    const newId = 'role_' + Math.random().toString(36).slice(2, 7);
    const newRole: UserRolePermission = {
      id: newId,
      name: 'Peran Kustom Baru',
      description: 'Deskripsi tugas peran kustom',
      isSystem: false,
      permissions: {
        canViewDashboard: true,
        canManageSetup: false,
        canManageAccounts: false,
        canManageMembers: false,
        canCreateTransaction: true,
        canEditTransaction: false,
        canDeleteTransaction: false,
        canViewTxHistory: false,
        canManageDues: true,
        canManageEvents: false,
        canViewReports: false,
        canExportReports: false,
        canManageUsers: false,
        canManageRoles: false,
        canViewActivityLogs: false,
        canAccessGasCenter: false,
      },
    };
    const updated = [...roleList, newRole];
    setRoleList(updated);
    setSelectedRoleId(newId);
  };

  const handleDeleteRole = (id: string) => {
    const target = roleList.find((r) => r.id === id);
    if (target?.isSystem) {
      alert('Peran sistem bawaan (Developer, Bendahara Utama, Admin, Pengurus) tidak dapat dihapus.');
      return;
    }
    if (confirm(`Yakin ingin menghapus peran "${target?.name}"?`)) {
      const filtered = roleList.filter((r) => r.id !== id);
      setRoleList(filtered);
      if (selectedRoleId === id) {
        setSelectedRoleId(filtered[0]?.id || '');
      }
    }
  };

  const handleStartEdit = () => {
    if (!activeRole) return;
    setTempName(activeRole.name);
    setTempDesc(activeRole.description);
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (!activeRole) return;
    const updated = roleList.map((r) => {
      if (r.id === activeRole.id) {
        return {
          ...r,
          name: tempName.trim() || r.name,
          description: tempDesc.trim() || r.description,
        };
      }
      return r;
    });
    setRoleList(updated);
    setIsEditingName(false);
  };

  const handleSaveAll = () => {
    onSaveRoles(roleList);
    onClose();
  };

  const categories = ['Akses Utama', 'Transaksi & Iuran', 'Laporan & Ekspor', 'Pengaturan & Sistem'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden z-10 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Hak Akses &amp; Peran (RBAC Matrix)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur checklist perizinan untuk menentukan apa yang boleh ditampilkan atau tidak ditampilkan oleh masing-masing peran.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Left roles list + Right checklist */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Roles Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daftar Peran
              </span>
              <button
                onClick={handleAddNewRole}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition"
              >
                <Plus size={13} />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {roleList.map((r) => {
                const isSelected = r.id === activeRole?.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`p-2.5 rounded-xl text-xs cursor-pointer border transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                        : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate leading-tight">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {r.isSystem ? 'Sistem Bawaan' : 'Peran Kustom'}
                      </div>
                    </div>
                    {!r.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(r.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 rounded transition"
                        title="Hapus peran ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Checklist Matrix */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeRole && (
              <>
                {/* Role Title & Quick Edit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {!isEditingName ? (
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{activeRole.name}</span>
                        {activeRole.isSystem && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            Sistem Bawaan
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeRole.description}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Nama Peran"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={tempDesc}
                        onChange={(e) => setTempDesc(e.target.value)}
                        placeholder="Deskripsi singkat tugas peran"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isEditingName ? (
                      <button
                        onClick={handleStartEdit}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                      >
                        <Edit3 size={13} />
                        <span>Edit Info</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-1.5"
                      >
                        <Check size={13} />
                        <span>Simpan Nama</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Categorized Permission Checklists */}
                {categories.map((cat) => {
                  const itemsInCat = PERMISSION_CONFIG.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="space-y-2.5">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                        {cat}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {itemsInCat.map((item) => {
                          const isAllowed = !!activeRole.permissions[item.key];
                          return (
                            <label
                              key={item.key}
                              className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 select-none ${
                                isAllowed
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={() => handleTogglePermission(item.key)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <div>
                                <div className="text-xs font-bold leading-tight">
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                  {item.desc}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-slate-400" />
            <span>Perubahan hak akses berlaku seketika untuk semua pengguna dengan peran tersebut.</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Terapkan Hak Akses</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
