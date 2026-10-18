import React, { useState } from 'react';
import { X, DownloadCloud, Monitor, Smartphone, CheckCircle, Apple, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  isIOS?: boolean;
  deferredPrompt?: any;
  onTriggerInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable = false,
  isInstalled = false,
  isIOS = false,
  deferredPrompt,
  onTriggerInstall,
}) => {
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = () => {
    onTriggerInstall();
  };

  const hasPrompt = isInstallable || !!deferredPrompt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 transition-all text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
            <DownloadCloud size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Install Aplikasi GABSI Batu
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PWA Siap
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pasang langsung ke HP atau PC Anda untuk akses cepat, mandiri, dan offline
            </p>
          </div>
        </div>

        {/* Primary 1-Click Action Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50 dark:from-sky-950/50 dark:via-blue-950/30 dark:to-indigo-950/40 border border-sky-200/80 dark:border-sky-800/80 shadow-sm">
          {isInstalled ? (
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="text-xs font-bold">Aplikasi Telah Terpasang di Perangkat Ini!</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400/90">
                  Anda sudah menjalankan GABSI Batu sebagai PWA mandiri.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-sky-950 dark:text-sky-200">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Tombol Pasang Langsung (1-Klik)</span>
                </div>
                <div className="text-[11px] text-sky-700 dark:text-sky-300/80 mt-0.5">
                  {hasPrompt
                    ? 'Browser siap memasang aplikasi ke desktop / homescreen dalam 1 klik!'
                    : isIOS
                    ? 'Khusus iPhone/iPad: gunakan menu Bagikan Safari.'
                    : 'Klik tombol di samping untuk memicu instalasi otomatis browser.'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallClick}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-600/30 hover:shadow-sky-600/40 transition flex items-center justify-center gap-2 flex-shrink-0"
              >
                <DownloadCloud size={16} />
                <span>Install Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* PWA Certified Badge / Technical status */}
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <ShieldCheck size={16} className="text-emerald-500 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">PWA Manifest</div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Aktif &amp; Terverifikasi</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <CheckCircle size={16} className="text-sky-500 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Service Worker</div>
            <div className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">Auto-Update Siap</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <Smartphone size={16} className="text-amber-500 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Ikon Resolusi Tinggi</div>
            <div className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">192px &amp; 512px HD</div>
          </div>
        </div>

        {/* Panduan Cepat jika browser butuh interaksi manual */}
        <div className="space-y-2.5 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
            Panduan Sesuai Perangkat Anda
          </div>

          {/* Android Smartphone */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Smartphone size={15} className="text-sky-500" />
              <span>HP Android (Google Chrome / Edge)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Cukup klik tombol <strong>&quot;Install Sekarang&quot;</strong> di atas. Jika tidak muncul dialog, ketuk tombol <strong>⋮ (titik tiga)</strong> di kanan atas Chrome &gt; pilih <strong>&quot;Install Aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
            </p>
          </div>

          {/* PC / Laptop */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Monitor size={15} className="text-emerald-500" />
              <span>PC &amp; Laptop (Windows / Mac)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Klik <strong>&quot;Install Sekarang&quot;</strong> di atas, atau klik ikon <strong>Install App (monitor bertanda panah)</strong> di bilah alamat URL (address bar) kanan atas Chrome/Edge.
            </p>
          </div>

          {/* iOS iPhone / iPad */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <Apple size={15} className="text-slate-800 dark:text-slate-200" />
              <span>iPhone &amp; iPad (Apple Safari)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Buka di <strong>Safari</strong>, ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah &gt; gulir ke bawah dan pilih <strong>&quot;Tambahkan ke Layar Utama (Add to Home Screen)&quot;</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">
            PWA Standar W3C &bull; GABSI Kota Batu
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
