import { CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
];

/**
 * Format currency safely with locale-aware thousand separators and decimal conventions.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyConfig,
  options?: { hideDecimals?: boolean; compact?: boolean }
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currency.symbol}0`;
  }

  if (options?.compact) {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  const fractionDigits = options?.hideDecimals
    ? 0
    : currency.code === 'JPY'
    ? 0
    : 2;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString(currency.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }
}

/**
 * Format date in friendly human-readable format
 */
export function formatDate(dateString: string, style: 'short' | 'medium' | 'full' | 'relative' = 'medium'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (style === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < -1 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
  }

  if (style === 'short') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (style === 'full') {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate percentage safely
 */
export function formatPercentage(value: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
