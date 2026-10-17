import React, { useState, useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import { formatNumber, formatThousands, parseThousands, terbilangRupiah } from '../utils/formatters';

interface CurrencyAmountInputProps {
  value: number | '';
  onChange: (val: number | '') => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  showTerbilang?: boolean;
  showCornerAmount?: boolean;
  showQuickChips?: boolean;
  min?: number;
  autoFocus?: boolean;
}

export const CurrencyAmountInput: React.FC<CurrencyAmountInputProps> = ({
  value,
  onChange,
  label = 'Nominal (Rp)',
  placeholder = '0',
  required = false,
  disabled = false,
  className = '',
  id,
  showTerbilang = true,
  showCornerAmount = true,
  showQuickChips = true,
  autoFocus = false,
}) => {
  // Synchronized text representation
  const [displayValue, setDisplayValue] = useState<string>(() =>
    value === '' || value === null || value === undefined ? '' : formatThousands(value)
  );

  // Sync internal display if prop value changes externally
  useEffect(() => {
    const formatted =
      value === '' || value === null || value === undefined ? '' : formatThousands(value);
    setDisplayValue(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseThousands(raw);
    if (num === '') {
      setDisplayValue('');
      onChange('');
    } else {
      setDisplayValue(formatThousands(num));
      onChange(num);
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    onChange('');
  };

  const handleAddQuick = (increment: number) => {
    const current = typeof value === 'number' ? value : 0;
    const next = current + increment;
    setDisplayValue(formatThousands(next));
    onChange(next);
  };

  const hasValue = value !== '' && typeof value === 'number' && value > 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Top Label & Corner Amount Indicator */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label
            htmlFor={id}
            className="block font-semibold text-slate-700 dark:text-slate-300 text-xs"
          >
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        )}

        {/* Pojok kanan ada angka */}
        {showCornerAmount && (
          <div
            className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border transition-all ${
              hasValue
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}
            title="Nilai nominal terformat"
          >
            Rp {formatNumber(value || 0)}
          </div>
        )}
      </div>

      {/* Input Field with Rp prefix and right-aligned digits */}
      <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden shadow-xs transition">
        <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-r border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold font-mono text-xs select-none">
          Rp
        </span>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-right font-mono font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-wide placeholder:text-slate-400 focus:outline-none"
        />

        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Bersihkan nominal"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Teks Terbilang : Nilai */}
      {showTerbilang && (
        <div className="px-3 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 flex items-start gap-2 text-xs transition-all shadow-xs">
          <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
            <Volume2 size={13} />
          </div>
          <div className="flex-1 min-w-0 leading-relaxed">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              Terbilang :{' '}
            </span>
            <span
              className={`italic font-semibold ${
                hasValue
                  ? 'text-slate-900 dark:text-emerald-100'
                  : 'text-slate-400 dark:text-slate-500 font-normal'
              }`}
            >
              {hasValue ? terbilangRupiah(value) : 'Nol Rupiah'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Increment Chips (Opsional) */}
      {showQuickChips && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Tambah Cepat:
          </span>
          {[
            { label: '+10 rb', amt: 10000 },
            { label: '+50 rb', amt: 50000 },
            { label: '+100 rb', amt: 100000 },
            { label: '+500 rb', amt: 50000 },
            { label: '+1 jt', amt: 1000000 },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleAddQuick(chip.amt)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-200 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
