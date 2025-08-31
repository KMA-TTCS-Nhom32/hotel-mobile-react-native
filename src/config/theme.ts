/**
 * Theme constants for components that need actual hex values
 * (like native components that don't support NativeWind classes)
 */

export const THEME_COLORS = {
  // Primary Brand Colors
  primary: {
    main: '#f97316',
    dark: '#ea580c',
    foreground: '#ffffff',
  },

  // Neutral Colors
  neutral: {
    dark: '#525252',
    darkest: '#262626',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
  },

  // Text Colors
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },

  // Border Colors
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
  },

  // Status Colors
  success: {
    main: '#22c55e',
  },

  error: {
    main: '#ef4444',
  },

  warning: {
    main: '#f59e0b',
  },
} as const;

/**
 * Tab navigation specific theme
 */
export const TAB_THEME = {
  activeColor: THEME_COLORS.primary.main,
  inactiveColor: THEME_COLORS.neutral.dark,
  backgroundColor: THEME_COLORS.background.primary,
  borderColor: THEME_COLORS.border.primary,
  headerBackgroundColor: THEME_COLORS.background.primary,
  headerTitleColor: THEME_COLORS.text.primary,
  headerTintColor: THEME_COLORS.primary.main,
} as const;
