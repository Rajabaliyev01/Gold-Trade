import React from 'react';
import { Phone } from 'lucide-react';

/**
 * Extract only the 9 local digits from an Uzbek phone number string
 * e.g. "+998 99 899 89" -> "9989989"
 * e.g. "+998 90 123 45 67" -> "901234567"
 */
export function extractLocalDigits(val) {
  if (!val) return '';
  let str = String(val).trim();
  // Strip leading +998 only if it starts with +998
  if (str.startsWith('+998')) {
    str = str.slice(4);
  } else if (str.startsWith('998') && str.replace(/\D/g, '').length > 9) {
    str = str.slice(3);
  }
  return str.replace(/\D/g, '').slice(0, 9);
}

/**
 * Format 9 local digits as: XX XXX XX XX
 * e.g. "901234567" -> "90 123 45 67"
 * e.g. "9989989" -> "99 899 89"
 */
export function formatLocalDigits(digits) {
  if (!digits) return '';
  const d = String(digits).replace(/\D/g, '').slice(0, 9);
  let res = '';
  if (d.length > 0) res += d.slice(0, 2);
  if (d.length > 2) res += ' ' + d.slice(2, 5);
  if (d.length > 5) res += ' ' + d.slice(5, 7);
  if (d.length > 7) res += ' ' + d.slice(7, 9);
  return res;
}

/**
 * Reusable PhoneInput component with locked +998 badge
 * Allows easy typing and deleting (backspace) of the 9 local digits.
 */
export const PhoneInput = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = '90 123 45 67',
  className = '',
  autoFocus = false,
}) => {
  const localDigits = extractLocalDigits(value);
  const formattedDisplay = formatLocalDigits(localDigits);

  const handleInputChange = (e) => {
    // Extract only digits from current input value (up to 9 digits)
    const rawVal = e.target.value;
    const newDigits = rawVal.replace(/\D/g, '').slice(0, 9);
    const formatted = formatLocalDigits(newDigits);
    const fullPhone = newDigits.length > 0 ? `+998 ${formatted}` : '';

    if (onChange) {
      onChange(fullPhone);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const input = e.target;
      const { selectionStart, selectionEnd } = input;
      // If cursor is right after a space (e.g. "90 |123"), delete the digit before the space
      if (selectionStart === selectionEnd && selectionStart > 1) {
        if (formattedDisplay[selectionStart - 1] === ' ') {
          e.preventDefault();
          const before = formattedDisplay.slice(0, selectionStart - 2);
          const after = formattedDisplay.slice(selectionStart);
          const newRaw = before + after;
          const newDigits = newRaw.replace(/\D/g, '').slice(0, 9);
          const formatted = formatLocalDigits(newDigits);
          const fullPhone = newDigits.length > 0 ? `+998 ${formatted}` : '';
          if (onChange) onChange(fullPhone);
          setTimeout(() => {
            if (input) {
              const newPos = Math.max(0, selectionStart - 2);
              input.setSelectionRange(newPos, newPos);
            }
          }, 0);
        }
      }
    }
  };

  return (
    <div
      className={`flex items-center rounded-xl bg-white/5 border border-white/10 transition-all overflow-hidden ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-[#0b0e14]'
          : 'focus-within:border-gold-500/60 focus-within:ring-1 focus-within:ring-gold-500/30'
      } ${className}`}
    >
      {/* Locked +998 Prefix Badge (Never deleted) */}
      <div className="px-3.5 py-2.5 bg-white/5 border-r border-white/10 flex items-center space-x-1.5 select-none text-gold-400 font-mono font-bold text-xs shrink-0">
        <Phone className="w-3.5 h-3.5 text-gold-400" />
        <span>+998</span>
      </div>

      {/* Local 9-digit input: easy backspace and typing */}
      <input
        type="tel"
        disabled={disabled}
        autoFocus={autoFocus}
        value={formattedDisplay}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={12} // 9 digits + 3 spaces = 12 characters
        className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
};
