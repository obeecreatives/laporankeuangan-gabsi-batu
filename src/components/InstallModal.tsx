import React from 'react';
import { X, DownloadCloud, Monitor, Smartphone, CheckCircle, Apple, Chrome } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <DownloadCloud size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Install Aplikasi Web GABSI Batu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Akses cepat tanpa browser bar di PC, Laptop, Android &amp; iPhone
            </p>
          </div>
        </div>

        {/* 1-Click Install Button if browser supports deferredPrompt */}
        {deferredPrompt && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-sky-900 dark:text-sky-200">
                Instalasi Otomatis Didukung Browser!
              </div>
              <div className="text-[11px] text-sky-700 dark:text-sky-400">
                Klik tombol untuk memasang langsung ke desktop/layar utama.
              </div>
            </div>
            <button
              onClick={onTriggerInstall}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-900/20 transition flex items-center gap-1.5"
            >
              <DownloadCloud size={14} />
              <span>Install Sekarang</span>
            </button>
          </div>
        )}

        {/* Guide Cards */}
        <div className="space-y-3.5 text-xs">
          {/* PC / Laptop */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
              <Monitor size={16} className="text-emerald-500" />
              <span>Cara Pasang di PC &amp; Laptop (Windows / Mac)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              <li>Buka aplikasi ini di browser Google Chrome, Microsoft Edge, atau Brave.</li>
              <li>Lihat di pojok kanan address bar (bilah URL), klik ikon <strong>&quot;Install App&quot;</strong> (ikon monitor dengan panah ke bawah).</li>
              <li>Aplikasi akan langsung muncul sebagai jendela mandiri di desktop Anda!</li>
            </ol>
          </div>

          {/* Android Smartphone */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
              <Smartphone size={16} className="text-sky-500" />
              <span>Cara Pasang di HP Android</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              <li>Buka di Google Chrome Android.</li>
              <li>Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas browser.</li>
              <li>Pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Install Aplikasi&quot;</strong>.</li>
              <li>Ikon GABSI Batu akan terpasang layaknya aplikasi Play Store.</li>
            </ol>
          </div>

          {/* iOS iPhone / iPad */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1.5">
              <Apple size={16} className="text-slate-700 dark:text-slate-300" />
              <span>Cara Pasang di iPhone / iPad (Safari)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
              <li>Buka tautan ini di browser <strong>Safari</strong> iPhone.</li>
              <li>Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah layar (ikon kotak dengan panah ke atas).</li>
              <li>Gulir ke bawah dan pilih <strong>&quot;Tambahkan ke Layar Utama&quot; (Add to Home Screen)</strong>.</li>
            </ol>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-xs hover:bg-slate-700 dark:hover:bg-slate-600 transition"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
