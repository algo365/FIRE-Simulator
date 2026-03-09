/**
 * Format a number as Indian currency (₹) with compact notation.
 * @param {number} amount
 * @param {boolean} compact  - use Cr/L abbreviations
 */
export const formatINR = (amount, compact = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1)} L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
    return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
};

/** Full Indian number format with commas */
export const formatINRFull = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
};

/** Format percentage */
export const formatPct = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
};

/** Short scale labels for Y-axis ticks */
export const yAxisFormatter = (val) => {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(0)}Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(0)}L`;
  return `₹${Math.round(val / 1000)}K`;
};

/** Colours used across the app */
export const COLORS = {
  primary: '#2563eb',
  growth: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
  purple:  '#8b5cf6',
  orange:  '#f97316',
  pink:    '#ec4899',
  teal:    '#14b8a6',
  scenario: ['#8b5cf6', '#f97316', '#ec4899', '#14b8a6', '#f59e0b'],
};
