import React from 'react';
import {
  Home,
  Sliders,
  Wallet,
  Users,
  Receipt,
  CalendarDays,
  BarChart3,
  PieChart,
  TrendingUp,
  Scale,
  ArrowLeftRight,
  ShieldCheck,
  History,
  HelpCircle,
  Server,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DownloadCloud,
  CheckCircle,
} from 'lucide-react';
import { ViewTab, UserRolePermission, UserAccount } from '../types';
import { APP_FOOTER_DEV } from '../utils/formatters';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: UserAccount | null;
  currentRole: UserRolePermission | undefined;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isInstalled?: boolean;
  onOpenGasCenter: () => void;
  onOpenHelp: () => void;
  onOpenInstall: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  currentRole,
  isCollapsed,
  onToggleCollapse,
  isInstalled = false,
  onOpenGasCenter,
  onOpenHelp,
  onOpenInstall,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const permissions = currentRole?.permissions;

  const navItems = [
    {
      id: 'beranda' as ViewTab,
      label: 'Beranda',
      icon: Home,
      num: null,
      visible: permissions?.canViewDashboard ?? true,
    },
    {
      id: 'setup' as ViewTab,
      label: 'Setup Kategori',
      icon: Sliders,
      num: 1,
      visible: permissions?.canManageSetup ?? false,
    },
    {
      id: 'akun' as ViewTab,
      label: 'Akun Kas & Bank',
      icon: Wallet,
      num: 2,
      visible: permissions?.canManageAccounts ?? false,
    },
    {
      id: 'anggota' as ViewTab,
      label: 'Data Anggota',
      icon: Users,
      num: 3,
      visible: permissions?.canManageMembers ?? false,
    },
    {
      id: 'transaksi' as ViewTab,
      label: 'Transaksi',
      icon: Receipt,
      num: 4,
      visible: true,
    },
    {
      id: 'iuran' as ViewTab,
      label: 'Iuran Anggota',
      icon: Sparkles,
      num: 5,
      visible: permissions?.canManageDues ?? true,
    },
    {
      id: 'event' as ViewTab,
      label: 'Event & Turnamen',
      icon: CalendarDays,
      num: 6,
      visible: permissions?.canManageEvents ?? false,
    },
    {
      id: 'rekap' as ViewTab,
      label: 'Rekap Tahunan',
      icon: BarChart3,
      num: 7,
      visible: permissions?.canViewReports ?? false,
    },
    {
      id: 'rincian' as ViewTab,
      label: 'Rincian Pengeluaran',
      icon: PieChart,
      num: 8,
      visible: permissions?.canViewReports ?? false,
    },
    {
      id: 'surplus' as ViewTab,
      label: 'Surplus / Defisit',
      icon: TrendingUp,
      num: 9,
      visible: permissions?.canViewReports ?? false,
    },
    {
      id: 'neraca' as ViewTab,
      label: 'Neraca Keuangan',
      icon: Scale,
      num: 10,
      visible: permissions?.canViewReports ?? false,
    },
    {
      id: 'aruskas' as ViewTab,
      label: 'Arus Kas',
      icon: ArrowLeftRight,
      num: 11,
      visible: permissions?.canViewReports ?? false,
    },
    {
      id: 'pengguna' as ViewTab,
      label: 'Kelola Pengguna & Peran',
      icon: ShieldCheck,
      num: 12,
      visible: (permissions?.canManageUsers || permissions?.canManageRoles) ?? false,
    },
    {
      id: 'riwayat' as ViewTab,
      label: 'Riwayat Aktivitas',
      icon: History,
      num: 13,
      visible: permissions?.canViewActivityLogs ?? false,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 select-none z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/40">
                G
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                  GABSI BATU
                </h1>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide">
                  LAPORAN KEUANGAN
                </p>
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md">
            G
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar (Mini Mode)'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} />
                </div>

                {!isCollapsed && (
                  <span className="flex-1 text-left truncate leading-tight">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.num && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.num}
                  </span>
                )}

                {/* Floating Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
      </nav>

      {/* Bottom Utility Actions */}
      <div className="p-2.5 border-t border-slate-800/80 space-y-1 bg-slate-900/60">
        {/* GAS Center Button (Khusus Developer / Site Engineer) */}
        {currentRole?.id === 'developer' && (
          <button
            onClick={onOpenGasCenter}
            title="Headless GAS Center & Endpoint Setup"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-amber-400 hover:bg-amber-950/30 transition group relative"
          >
            <Server size={17} className="flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Headless GAS Center</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-amber-300 text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Headless GAS Center
              </div>
            )}
          </button>
        )}

        {/* Install Web App Button */}
        <button
          onClick={onOpenInstall}
          title={isInstalled ? 'Aplikasi Terpasang (PWA Mandiri Aktif)' : 'Install Web App (Langsung ke Desktop / HP)'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition group relative ${
            isInstalled
              ? 'text-emerald-400 hover:bg-emerald-950/30'
              : 'text-sky-400 hover:bg-sky-950/30 bg-sky-950/10'
          }`}
        >
          {isInstalled ? (
            <CheckCircle size={17} className="flex-shrink-0 text-emerald-400" />
          ) : (
            <DownloadCloud size={17} className="flex-shrink-0 text-sky-400" />
          )}
          {!isCollapsed && (
            <span className="truncate">
              {isInstalled ? 'Aplikasi Terpasang' : 'Install Aplikasi'}
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-sky-300 text-xs rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              {isInstalled ? 'Aplikasi Terpasang (PWA)' : 'Install Aplikasi'}
            </div>
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Layar Penuh (Fullscreen)'}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition group relative"
        >
          {isFullscreen ? <Minimize2 size={17} className="flex-shrink-0" /> : <Maximize2 size={17} className="flex-shrink-0" />}
          {!isCollapsed && <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>}
        </button>

        {/* Bantuan Button */}
        <button
          onClick={onOpenHelp}
          title="Panduan & Kontak Developer"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition group relative"
        >
          <HelpCircle size={17} className="flex-shrink-0" />
          {!isCollapsed && <span>Bantuan & Dokumen</span>}
        </button>
      </div>

      {/* User Info & Copyright Footer */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-white truncate leading-tight">
                {currentUser?.name || 'User Aktif'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.email}
              </div>
            </div>
          </div>
          <div className="text-[9.5px] text-slate-500 line-clamp-2 leading-relaxed border-t border-slate-800/50 pt-2">
            {APP_FOOTER_DEV}
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 text-center">
          <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
        </div>
      )}
    </aside>
  );
};
