import React from 'react';
import {
  X,
  Home,
  Sliders,
  Wallet,
  Users,
  Receipt,
  Sparkles,
  CalendarDays,
  BarChart3,
  PieChart,
  TrendingUp,
  Scale,
  ArrowLeftRight,
  ShieldCheck,
  History,
  Server,
  DownloadCloud,
  HelpCircle,
} from 'lucide-react';
import { ViewTab, UserRolePermission, UserAccount } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  currentUser: UserAccount | null;
  currentRole: UserRolePermission | undefined;
  onOpenGasCenter: () => void;
  onOpenInstall: () => void;
  onOpenHelp: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  currentUser,
  currentRole,
  onOpenGasCenter,
  onOpenInstall,
  onOpenHelp,
}) => {
  if (!isOpen) return null;

  const permissions = currentRole?.permissions;

  const navItems = [
    { id: 'beranda' as ViewTab, label: 'Beranda', icon: Home, visible: permissions?.canViewDashboard ?? true },
    { id: 'setup' as ViewTab, label: '1. Setup Kategori', icon: Sliders, visible: permissions?.canManageSetup ?? false },
    { id: 'akun' as ViewTab, label: '2. Akun Kas & Bank', icon: Wallet, visible: permissions?.canManageAccounts ?? false },
    { id: 'anggota' as ViewTab, label: '3. Data Anggota', icon: Users, visible: permissions?.canManageMembers ?? false },
    { id: 'transaksi' as ViewTab, label: '4. Transaksi', icon: Receipt, visible: true },
    { id: 'iuran' as ViewTab, label: '5. Iuran Anggota', icon: Sparkles, visible: permissions?.canManageDues ?? true },
    { id: 'event' as ViewTab, label: '6. Event & Turnamen', icon: CalendarDays, visible: permissions?.canManageEvents ?? false },
    { id: 'rekap' as ViewTab, label: '7. Rekap Tahunan', icon: BarChart3, visible: permissions?.canViewReports ?? false },
    { id: 'rincian' as ViewTab, label: '8. Rincian Pengeluaran', icon: PieChart, visible: permissions?.canViewReports ?? false },
    { id: 'surplus' as ViewTab, label: '9. Surplus / Defisit', icon: TrendingUp, visible: permissions?.canViewReports ?? false },
    { id: 'neraca' as ViewTab, label: '10. Neraca', icon: Scale, visible: permissions?.canViewReports ?? false },
    { id: 'aruskas' as ViewTab, label: '11. Arus Kas', icon: ArrowLeftRight, visible: permissions?.canViewReports ?? false },
    { id: 'pengguna' as ViewTab, label: '12. Kelola Pengguna & Peran', icon: ShieldCheck, visible: (permissions?.canManageUsers || permissions?.canManageRoles) ?? false },
    { id: 'riwayat' as ViewTab, label: '13. Riwayat Aktivitas', icon: History, visible: permissions?.canViewActivityLogs ?? false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              G
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">GABSI KOTA BATU</div>
              <div className="text-[10px] text-emerald-400 font-medium">Navigasi Tab Cepat</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Badge */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="truncate">
            <div className="font-medium text-slate-200 truncate">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            {currentRole?.name}
          </span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-950/60 text-xs">
          {currentRole?.id === 'developer' && (
            <button
              onClick={() => {
                onClose();
                onOpenGasCenter();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-400 hover:bg-slate-800 transition"
            >
              <Server size={16} />
              <span>Headless GAS Center</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenInstall();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sky-400 hover:bg-slate-800 transition"
          >
            <DownloadCloud size={16} />
            <span>Install Web App</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
          >
            <HelpCircle size={16} />
            <span>Bantuan & Panduan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
