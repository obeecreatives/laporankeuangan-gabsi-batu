import React from 'react';
import { Home, Receipt, Sparkles, BarChart3, Menu } from 'lucide-react';
import { ViewTab } from '../types';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileMenu,
}) => {
  const tabs = [
    { id: 'beranda' as ViewTab, label: 'Beranda', icon: Home },
    { id: 'transaksi' as ViewTab, label: 'Transaksi', icon: Receipt },
    { id: 'iuran' as ViewTab, label: 'Iuran', icon: Sparkles },
    { id: 'rekap' as ViewTab, label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
              <Icon size={20} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu Drawer Button */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <div className="p-1 rounded-lg">
          <Menu size={20} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Semua Tab</span>
      </button>
    </div>
  );
};
