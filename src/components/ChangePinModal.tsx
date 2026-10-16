import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  isDefaultPin: boolean;
  onChangePin: (newPin: string) => Promise<boolean>;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  isDefaultPin,
  onChangePin,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPin.length < 6) {
      setErrorMsg('PIN baru minimal harus 6 karakter / angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN tidak cocok dengan PIN baru.');
      return;
    }
    if (newPin === '123456') {
      setErrorMsg('Harap jangan menggunakan PIN standar 123456 demi keamanan akun.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onChangePin(newPin);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Ganti PIN / Password Akses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
              {userEmail}
            </p>
          </div>
        </div>

        {isDefaultPin && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11.5px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <span>
              Anda saat ini masih menggunakan PIN standar. Sangat disarankan untuk mengganti PIN pribadi sebelum mencatat transaksi.
            </span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Check size={24} />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              PIN Berhasil Diperbarui!
            </div>
            <div className="text-xs text-slate-500">
              Gunakan PIN baru ini saat Anda login berikutnya.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIN Baru (Minimal 6 Digit Angka/Karakter)
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={12}
                  placeholder="Contoh: 882910"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ulangi Konfirmasi PIN Baru
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                maxLength={12}
                placeholder="Masukkan ulang PIN baru"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan PIN Baru'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
