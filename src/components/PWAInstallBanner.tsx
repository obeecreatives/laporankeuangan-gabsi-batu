import React, { useState } from 'react';
import { DownloadCloud, X, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  isInstalled: boolean;
  onInstall: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstalled,
  onInstall,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('gabsi_pwa_banner_dismissed') === 'true';
    }
    return false;
  });

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gabsi_pwa_banner_dismissed', 'true');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-sky-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/25">
            <DownloadCloud size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">Install Aplikasi GABSI</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-sky-500/30 text-sky-300">PWA</span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Pasang ke HP/PC untuk akses mandiri &amp; offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onInstall}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-500/30 transition flex items-center gap-1.5"
          >
            <DownloadCloud size={14} />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Tutup banner"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
