import React from 'react';
import { Phone } from 'lucide-react';

/**
 * Extract and format 9-digit Uzbekistan phone number as: XX XXX XX XX
 * e.g. 90 123 45 67
 */
export function formatUzbekPhoneDigits(val) {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length > 9) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9);

  let formatted = '';
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
  if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
  if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);

  return formatted;
}

/**
 * Convert formatted 9 digits to full international phone string: +998 XX XXX XX XX
 */
export function toFullUzbekPhone(formattedDigits) {
  const digits = (formattedDigits || '').replace(/\D/g, '');
  if (!digits) return '';
  const localDigits = digits.startsWith('998') && digits.length > 9 ? digits.slice(3) : digits;
  const f = formatUzbekPhoneDigits(localDigits);
  return f ? `+998 ${f}` : '';
}

/**
 * Reusable PhoneInput component with locked +998 badge
 */
export const PhoneInput = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = '90 123 45 67',
  className = '',
  autoFocus = false,
}) => {
  const localFormatted = formatUzbekPhoneDigits(value);

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatUzbekPhoneDigits(rawVal);
    const fullPhone = formatted ? `+998 ${formatted}` : '';
    if (onChange) {
      onChange(fullPhone);
    }
  };

  return (
    <div
      className={`flex items-center rounded-xl bg-[#141824] border border-luxury-border transition-all overflow-hidden ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-[#0b0e14]'
          : 'focus-within:border-gold-500/60 focus-within:ring-1 focus-within:ring-gold-500/30'
      } ${className}`}
    >
      {/* Locked +998 Prefix Badge */}
      <div className="px-3.5 py-2.5 bg-[#0d1017] border-r border-luxury-border flex items-center space-x-1.5 select-none text-gold-400 font-mono font-bold text-xs shrink-0">
        <Phone className="w-3.5 h-3.5 text-gold-400" />
        <span>+998</span>
      </div>

      {/* Local 9-digit input with XX XXX XX XX format */}
      <input
        type="tel"
        disabled={disabled}
        autoFocus={autoFocus}
        value={localFormatted}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={12} // 9 digits + 3 spaces = 12
        className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
};
