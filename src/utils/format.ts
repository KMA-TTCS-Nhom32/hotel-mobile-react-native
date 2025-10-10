/**
 * Format currency with proper symbol and decimal places
 * Defaults to Vietnamese Dong (VND) for hotel booking app in Vietnam
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'VND',
  locale: string = 'vi-VN'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for VND: number + ₫ symbol
    return `${amount.toLocaleString('vi-VN')}₫`;
  }
};

/**
 * Format number with thousands separator
 * Defaults to Vietnamese locale (vi-VN) for consistency with currency formatting
 */
export const formatNumber = (num: number, locale: string = 'vi-VN'): string => {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return num.toString();
  }
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Round to specific decimal places
 */
export const roundTo = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Format date to DD-MM-YYYY for display
 * Uses device's local time, NOT UTC
 * @param date - Date object
 * @returns Formatted date string (DD-MM-YYYY)
 */
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date for backend API (DD-MM-YYYY)
 * Uses device's local time, NOT UTC
 * IMPORTANT: Backend expects DD-MM-YYYY format
 * @param date - Date object
 * @returns Formatted date string for API (DD-MM-YYYY)
 */
export const formatDateForAPI = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date to YYYY-MM-DD for calendar components (react-native-calendars)
 * Uses device's local time, NOT UTC
 * @param date - Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDateForCalendar = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Parse date from calendar string (YYYY-MM-DD) to Date object
 * Creates date in local timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export const parseDateFromCalendar = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
