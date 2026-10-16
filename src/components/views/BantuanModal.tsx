import React from 'react';
import { X, HelpCircle, BookOpen, UserCheck, ShieldAlert, PhoneCall, Code2 } from 'lucide-react';
import { APP_FOOTER_DEV } from '../../utils/formatters';

interface BantuanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BantuanModal: React.FC<BantuanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 max-h-[88vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bridge Kota Batu — Panduan Teknis &amp; Bantuan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Versi Aplikasi 2.0 Modern • Standalone REST API Architecture
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <UserCheck size={15} className="text-emerald-500" />
              <span>Alur Kerja Pengelolaan Keuangan:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-[11.5px]">
              <li><strong>Beranda:</strong> Menampilkan ringkasan saldo seluruh akun kas/bank, total pemasukan & pengeluaran bulan berjalan, serta peringatan otomatis jika ada akun yang minus.</li>
              <li><strong>Setup:</strong> Tambahkan kategori sumber pemasukan dan jenis pengeluaran operasional. Gunakan tombol &quot;Muat Referensi Umum&quot; untuk memulai cepat.</li>
              <li><strong>Akun:</strong> Daftarkan rekening kas tunai, bank, atau e-wallet beserta saldo awal saat pembukuan dimulai.</li>
              <li><strong>Anggota:</strong> Input data anggota/atlet bridge beserta besaran komitmen iuran wajib per bulan.</li>
              <li><strong>Transaksi:</strong> Catat mutasi kas masuk, keluar, atau transfer antar rekening. Anda dapat mengekspor rekap mutasi ke file Excel/CSV kapan saja.</li>
              <li><strong>Iuran:</strong> Catat setoran iuran bulanan yang secara otomatis akan tercatat sebagai transaksi pemasukan dan memperbarui status pelunasan anggota.</li>
              <li><strong>Event / Kejuaraan:</strong> Pantau efisiensi anggaran per turnamen melalui rekap surplus/defisit kegiatan.</li>
              <li><strong>Laporan Keuangan Resmi (LPJ):</strong> Buka tab Rekap, Rincian, Surplus/Defisit, Neraca, atau Arus Kas, lalu klik tombol &quot;Export PDF&quot; untuk mencetak format LPJ siap ttd.</li>
            </ol>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-emerald-950 dark:text-emerald-200">
            <h4 className="font-bold text-xs flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-emerald-600" />
              <span>Sistem Login &amp; Hak Akses (RBAC):</span>
            </h4>
            <p className="text-[11.5px] leading-relaxed">
              Pengguna dapat login menggunakan alamat Email terdaftar dan PIN standar <code>123456</code>. Setelah login pertama kali, setiap pengguna dapat mengganti PIN pribadinya secara mandiri melalui menu profil di pojok kanan atas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <Code2 size={15} className="text-amber-400" />
                <span>Informasi Pengembang &amp; Dukungan Teknis:</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">v2.0 Standalone</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {APP_FOOTER_DEV}
            </p>
            <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-2">
              <PhoneCall size={12} className="text-emerald-400" />
              <span>Jika menemukan kendala teknis atau kebutuhan kustomisasi sistem, hubungi <strong>Lalu Mahendra</strong>.</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
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
