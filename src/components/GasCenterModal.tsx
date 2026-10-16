import React, { useState } from 'react';
import {
  X,
  Server,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Save,
  RefreshCw,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  ShieldCheck,
} from 'lucide-react';
import { GAS_STANDALONE_SCRIPT } from '../services/gasStandaloneCode';
import { pingGasEndpoint, GasPingResult } from '../services/gasApi';

interface GasCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onPullFromGas: () => Promise<void>;
  onPushToGas: () => Promise<void>;
  isSyncing: boolean;
}

export const GasCenterModal: React.FC<GasCenterModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onSaveGasUrl,
  onPullFromGas,
  onPushToGas,
  isSyncing,
}) => {
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<GasPingResult | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoint' | 'script' | 'guide'>('endpoint');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GAS_STANDALONE_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const result = await pingGasEndpoint(urlInput);
      setPingResult(result);
    } finally {
      setPinging(false);
    }
  };

  const handleSaveAndTest = async () => {
    onSaveGasUrl(urlInput);
    await handlePing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden z-10 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Headless GAS Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
                  Opsi 2: Standalone REST
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat integrasi API Web App dengan Google Sheets ID: 1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('endpoint')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'endpoint'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Activity size={15} />
            <span>Endpoint & Status Koneksi</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'script'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Copy size={15} />
            <span>Salin Skrip GAS Standalone</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Panduan Pasang 3 Menit</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {activeTab === 'endpoint' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  URL Web App Google Apps Script (/exec)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveAndTest}
                      disabled={pinging}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Save size={14} />
                      <span>Simpan & Tes</span>
                    </button>
                    <button
                      onClick={handlePing}
                      disabled={pinging || !urlInput.trim()}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} className={pinging ? 'animate-spin' : ''} />
                      <span>Tes Ping</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Didapatkan dari menu <strong>Deploy &gt; New deployment &gt; Web app</strong> di editor Google Apps Script dengan izin <em>Who has access: Anyone</em>.
                </p>
              </div>

              {/* Ping Diagnostic Result */}
              {pingResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs ${
                    pingResult.ok
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          pingResult.ok ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>{pingResult.ok ? 'Koneksi Berhasil!' : 'Koneksi Terhambat'}</span>
                    </div>
                    <span className="font-mono text-[11px]">{pingResult.latencyMs} ms</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{pingResult.message}</p>
                  {pingResult.data?.spreadsheetTitle && (
                    <div className="mt-2 text-[11px] opacity-80 border-t border-current/20 pt-1.5">
                      Spreadsheet Terhubung: <strong>{pingResult.data.spreadsheetTitle}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Two-Way Actions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Sinkronisasi Dua Arah (Two-Way Sync)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tarik data terbaru dari Google Sheets atau unggah perubahan lokal ke sheet.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={onPullFromGas}
                    disabled={isSyncing || !urlInput.trim()}
                    className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ArrowDownToLine size={16} />
                    <span>Tarik Data Terbaru dari Sheets</span>
                  </button>

                  <button
                    onClick={onPushToGas}
                    disabled={isSyncing || !urlInput.trim()}
                    className="p-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ArrowUpToLine size={16} />
                    <span>Unggah Seluruh Data ke Sheets</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Skrip Standalone Google Apps Script Siap Pakai
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Skrip ini sudah memuat ID Spreadsheet GABSI Batu (1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4) dengan LockService anti-race condition.
                  </p>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] max-h-80 overflow-y-auto leading-relaxed border border-slate-800">
                  {GAS_STANDALONE_SCRIPT}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <span>Langkah Pemasangan Backend GAS Standalone:</span>
              </div>

              <ol className="list-decimal pl-5 space-y-2.5">
                <li>
                  Buka{' '}
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    script.google.com <ExternalLink size={12} />
                  </a>{' '}
                  menggunakan akun Google Anda.
                </li>
                <li>
                  Klik tombol <strong>+ Project Baru</strong> (New project).
                </li>
                <li>
                  Beri judul project, misalnya <em>&quot;GABSI Batu - REST API Standalone&quot;</em>.
                </li>
                <li>
                  Hapus semua kode bawaan di tab <code>Code.gs</code>, lalu <strong>Paste</strong> skrip yang telah disalin dari tab <em>&quot;Salin Skrip GAS Standalone&quot;</em>.
                </li>
                <li>
                  Klik ikon <strong>Simpan</strong> (Disket).
                </li>
                <li>
                  Klik tombol biru <strong>Deploy &gt; New deployment</strong> di pojok kanan atas.
                  <ul className="list-disc pl-5 mt-1 text-[11.5px] space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Pilih jenis (roda gigi): <strong>Web app</strong>.</li>
                    <li>Description: <em>Versi 2.0 REST API Standalone</em>.</li>
                    <li>Execute as: <strong>Me (Akun Anda)</strong>.</li>
                    <li>Who has access: <strong>Anyone</strong> (Penting agar web app bisa membaca dan menulis data).</li>
                  </ul>
                </li>
                <li>
                  Klik <strong>Deploy</strong>. Jika muncul jendela otorisasi Google, klik <em>Review permissions</em> &gt; pilih akun Google Anda &gt; klik <em>Advanced</em> &gt; klik <em>Go to GABSI Batu (unsafe)</em> &gt; klik <em>Allow</em>.
                </li>
                <li>
                  Salin <strong>Web app URL</strong> (yang berakhiran <code>/exec</code>), lalu masukkan ke input di tab <em>&quot;Endpoint &amp; Status Koneksi&quot;</em> di atas, lalu klik <strong>Simpan &amp; Tes</strong>. Selesai!
                </li>
              </ol>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11.5px] text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Keamanan Terjamin:</strong> Karena Anda menggunakan Opsi Standalone, sheet <em>1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4</em> tetap aman dari otak-atik kode. Hanya akun pemilik script ini yang dapat melihat kode backend.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-xs hover:bg-slate-700 dark:hover:bg-slate-600 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
