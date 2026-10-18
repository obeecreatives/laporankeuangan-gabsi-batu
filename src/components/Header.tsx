import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Sun,
  Moon,
  KeyRound,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  SlidersHorizontal,
  DownloadCloud,
} from 'lucide-react';
import { UserRolePermission, UserAccount, ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  currentUser: UserAccount | null;
  currentRole: UserRolePermission | undefined;
  roles: UserRolePermission[];
  onSelectRole: (roleId: string) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime: string | null;
  onManualSync: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenChangePin: () => void;
  onOpenRoleSettings: () => void;
  onOpenGasCenter: () => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  isInstalled?: boolean;
  onOpenInstall?: () => void;
}

const TAB_TITLES: Record<ViewTab, { title: string; subtitle: string }> = {
  beranda: { title: 'Beranda Ringkasan', subtitle: 'Ikhtisar posisi keuangan dan mutasi kas Bridge Kota Batu' },
  setup: { title: 'Setup Kategori', subtitle: 'Atur pos sumber pemasukan & jenis pengeluaran operasional' },
  akun: { title: 'Akun Kas & Bank', subtitle: 'Monitoring saldo buku kas tunai, rekening bank, dan digital wallet' },
  anggota: { title: 'Data Anggota & Atlet', subtitle: 'Direktori anggota klub dan ketetapan iuran wajib bulanan' },
  transaksi: { title: 'Buku Transaksi Kas', subtitle: 'Pencatatan pemasukan, pengeluaran, dan transfer antar akun' },
  iuran: { title: 'Iuran Wajib Anggota', subtitle: 'Pantau status pembayaran iuran bulanan seluruh anggota' },
  event: { title: 'Turnamen & Kejuaraan', subtitle: 'Kalkulasi anggaran & surplus/defisit kegiatan kejuaraan' },
  rekap: { title: 'Rekap Tahunan', subtitle: 'Grafik komparasi pemasukan vs pengeluaran tahunan' },
  rincian: { title: 'Rincian Pengeluaran', subtitle: 'Komposisi pengeluaran per pos kegiatan dan persentase' },
  surplus: { title: 'Surplus / Defisit', subtitle: 'Laporan laba rugi realisasi anggaran periode berjalan' },
  neraca: { title: 'Neraca Keuangan', subtitle: 'Posisi aset, kewajiban, dan saldo dana organisasi' },
  aruskas: { title: 'Laporan Arus Kas', subtitle: 'Mutasi kas masuk dan kas keluar per rekening operasional' },
  pengguna: { title: 'Pengguna & Hak Akses', subtitle: 'Manajemen pengguna, PIN akses, dan konfigurasi hak akses peran' },
  riwayat: { title: 'Riwayat Audit Aktivitas', subtitle: 'Log jejak digital perubahan data oleh seluruh pengurus' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  currentRole,
  roles,
  onSelectRole,
  syncStatus,
  lastSyncTime,
  onManualSync,
  themeMode,
  onToggleTheme,
  onOpenChangePin,
  onOpenRoleSettings,
  onOpenGasCenter,
  onLogout,
  onOpenMobileMenu,
  isInstalled = false,
  onOpenInstall,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabInfo = TAB_TITLES[currentTab] || { title: 'GABSI Batu', subtitle: '' };

  const canSwitchRole =
    currentUser?.roleId === 'developer' ||
    currentUser?.roleId === 'bendahara_utama' ||
    currentRole?.permissions.canManageRoles;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Mobile hamburger & Tab Title (gives full priority to title space on mobile) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Menu Navigasi"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-current rounded-full"></span>
              <span className="w-3/4 h-0.5 bg-current rounded-full"></span>
              <span className="w-full h-0.5 bg-current rounded-full"></span>
            </div>
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate leading-tight flex items-center gap-2">
              <span className="truncate">{tabInfo.title}</span>
              {currentRole && (
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {currentRole.name}
                </span>
              )}
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {tabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Compact on Mobile, Full on Desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* 1. Desktop-Only Dedicated RBAC Role Selector Dropdown */}
          <div className="relative hidden sm:block" ref={roleRef}>
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Ganti Peran Aktif (RBAC Selector)"
            >
              <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="max-w-[120px] truncate">
                {currentRole?.name || 'Pilih Peran'}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span>Role-Based Access</span>
                  {canSwitchRole && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenRoleSettings();
                      }}
                      className="text-emerald-600 hover:underline capitalize font-semibold text-[10.5px]"
                    >
                      Kelola Peran
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {roles.map((r) => {
                    const isCurrent = r.id === currentRole?.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectRole(r.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition ${
                          isCurrent
                            ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-semibold">{r.name}</div>
                          <div className="text-[10.5px] text-slate-400 font-normal truncate">
                            {r.description}
                          </div>
                        </div>
                        {isCurrent && <span className="text-emerald-600 font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Sync Status Badge (Text on Desktop, Compact on Mobile) */}
          <button
            onClick={onManualSync}
            disabled={syncStatus === 'syncing'}
            title={`Status: ${syncStatus}. Terakhir sync: ${lastSyncTime || 'Belum pernah'}. Klik untuk sinkronisasi manual.`}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : syncStatus === 'syncing'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {/* Live Pulsing Dot */}
            <span className="relative flex h-2 w-2">
              {syncStatus === 'synced' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              {syncStatus === 'syncing' && (
                <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-t border-amber-500"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              ></span>
            </span>

            <span className="hidden md:inline">
              {syncStatus === 'synced' && 'Tersinkron'}
              {syncStatus === 'syncing' && 'Menyinkronkan...'}
              {syncStatus === 'offline' && 'Offline'}
              {syncStatus === 'error' && 'Sync Gagal'}
            </span>

            <RefreshCw
              size={12}
              className={`text-current ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
            />
          </button>

          {/* 3. Desktop-Only Theme Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            title={themeMode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {themeMode === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-slate-600" />
            )}
          </button>

          {/* 3b. Quick 1-Click Install Button in Header */}
          {!isInstalled && onOpenInstall && (
            <button
              onClick={onOpenInstall}
              title="Install Aplikasi GABSI Batu (1-Klik ke HP / Desktop)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs shadow-sm shadow-sky-600/20 transition"
            >
              <DownloadCloud size={13} className="text-white" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* 4. Unified Profile & Quick Settings Dropdown (Contains Role Switcher & Toggles on Mobile!) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
              }}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              title="Menu Profil & Pengaturan Cepat"
            >
              <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Mobile backdrop overlay */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs sm:hidden"
                onClick={() => setShowUserMenu(false)}
              />
            )}

            {/* Dropdown Menu - Perfectly anchored right-0 within screen bounds without overflow */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-[320px] sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs overflow-hidden">
                {/* User Profile Card */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {currentRole?.name}
                    </span>
                    {currentUser?.isDefaultPin && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                        PIN Standar
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Unified Role Switcher (Integrated cleanly inside this single dropdown!) */}
                <div className="sm:hidden px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield size={12} className="text-emerald-500" />
                      <span>Ganti Peran (RBAC)</span>
                    </span>
                    {canSwitchRole && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenRoleSettings();
                        }}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10.5px] font-semibold"
                      >
                        Kelola
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {roles.map((r) => {
                      const isCurrent = r.id === currentRole?.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            onSelectRole(r.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <span className="truncate text-xs">{r.name}</span>
                          {isCurrent && <span className="text-emerald-600 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Unified Toggles: Theme Mode & Sync Status */}
                <div className="sm:hidden px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700/80 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal size={12} className="text-emerald-500" />
                    <span>Opsi Tampilan & Sinkronisasi</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                      Mode Tampilan
                    </span>
                    <button
                      onClick={onToggleTheme}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition active:scale-95"
                    >
                      {themeMode === 'dark' ? (
                        <>
                          <Sun size={13} className="text-amber-400" />
                          <span>Terang</span>
                        </>
                      ) : (
                        <>
                          <Moon size={13} className="text-slate-600" />
                          <span>Gelap</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions & Security */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenChangePin();
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition"
                  >
                    <KeyRound size={15} className="text-slate-400" />
                    <span>Ganti PIN / Password</span>
                  </button>

                  {onOpenInstall && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenInstall();
                      }}
                      className="w-full text-left px-3.5 py-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-center gap-2.5 transition font-medium"
                    >
                      <DownloadCloud size={15} />
                      <span>{isInstalled ? 'Aplikasi Terpasang (PWA) ✓' : 'Install Aplikasi (1-Klik)'}</span>
                    </button>
                  )}

                  {canSwitchRole && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenRoleSettings();
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition"
                    >
                      <Layers size={15} className="text-slate-400" />
                      <span>Atur Hak Akses & Peran</span>
                    </button>
                  )}

                  {currentRole?.id === 'developer' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenGasCenter();
                      }}
                      className="w-full text-left px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition"
                    >
                      <Sparkles size={15} className="text-amber-500" />
                      <span>Headless GAS Center</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition font-semibold"
                  >
                    <LogOut size={15} />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
