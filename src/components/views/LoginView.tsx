import React, { useState } from 'react';
import { Shield, KeyRound, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserAccount } from '../../types';
import { APP_FOOTER_DEV } from '../../utils/formatters';

interface LoginViewProps {
  users: UserAccount[];
  onLogin: (email: string, pin: string) => boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanEmail || !cleanPin) {
      setErrorMsg('Harap masukkan email dan PIN / Password.');
      return;
    }

    const success = onLogin(cleanEmail, cleanPin);
    if (!success) {
      setErrorMsg('Email atau PIN tidak cocok. Silakan periksa kembali kombinasi email dan PIN akses Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 select-none">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-emerald-950/60 mb-3">
            G
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            GABSI KOTA BATU
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-0.5">
            Laporan Keuangan Bendahara
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300">
            <Shield size={12} className="text-emerald-400" />
            <span>Akses Masuk Terproteksi PIN</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gabsibatu.org atau Gmail"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                PIN Akses / Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={12}
                placeholder="Masukkan 6-digit PIN akses"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-xs font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
              <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 group mt-2"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-[10.5px] text-slate-500 max-w-sm leading-relaxed">
        {APP_FOOTER_DEV}
      </div>
    </div>
  );
};
