/**
 * Formatting utilities for Gold Trade ERP
 */

// Format weight strictly to milligram precision (3 decimal places, e.g. 15.432 gr)
export const formatWeight = (val, suffix = ' gr') => {
  if (val === null || val === undefined || isNaN(val)) return '0.000' + suffix;
  const num = Number(val);
  return num.toFixed(3) + suffix;
};

// Format currency in USD or UZS
export const formatCurrency = (val, currency = 'USD') => {
  if (val === null || val === undefined || isNaN(val)) return '$0';
  const num = Number(val);
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(num);
  } else {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(num)) + " so'm";
  }
};

// Format percentage with 2 decimal places
export const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0.00%';
  return Number(val).toFixed(2) + '%';
};

// Format date in Uzbek / International standard
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format detailed date and time with seconds (for audit trails & timelines)
export const formatDateTimeDetailed = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

// Proba labels with color indicators
export const PROBA_COLORS = {
  999: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  750: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  585: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  375: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
};
