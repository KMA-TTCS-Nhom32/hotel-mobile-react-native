/**
 * AHomeVilla Color Reference
 *
 * This file provides easy reference to our semantic color scheme.
 * All colors are defined in tailwind.config.js and used via NativeWind classes.
 *
 * Usage Examples:
 * - Text: className="text-primary-main"
 * - Background: className="bg-primary-main"
 * - Border: className="border-primary-main"
 *
 * Color Palette inspired by Vietnamese hotel booking apps (mvillage.vn, go2joy.vn)
 */

export const COLOR_REFERENCE = {
  // Primary Brand Colors (Orange - warm, welcoming)
  primary: {
    lightest: 'primary-lightest', // className="bg-primary-lightest"
    lighter: 'primary-lighter', // className="bg-primary-lighter"
    light: 'primary-light', // className="bg-primary-light"
    main: 'primary-main', // className="bg-primary-main" - Main brand
    dark: 'primary-dark', // className="bg-primary-dark"
    darker: 'primary-darker', // className="bg-primary-darker"
    darkest: 'primary-darkest', // className="bg-primary-darkest"
    foreground: 'primary-foreground', // className="text-primary-foreground"
  },

  // Secondary Colors (Neutral - professional)
  secondary: {
    lightest: 'secondary-lightest',
    lighter: 'secondary-lighter',
    light: 'secondary-light',
    main: 'secondary-main',
    dark: 'secondary-dark',
    darker: 'secondary-darker',
    darkest: 'secondary-darkest',
    foreground: 'secondary-foreground',
  },

  // Accent Colors (Amber - warm, inviting)
  accent: {
    lightest: 'accent-lightest',
    lighter: 'accent-lighter',
    light: 'accent-light',
    main: 'accent-main',
    dark: 'accent-dark',
    darker: 'accent-darker',
    darkest: 'accent-darkest',
    foreground: 'accent-foreground',
  },

  // Luxury Colors (Purple - premium experiences)
  luxury: {
    lightest: 'luxury-lightest',
    lighter: 'luxury-lighter',
    light: 'luxury-light',
    main: 'luxury-main',
    dark: 'luxury-dark',
    darker: 'luxury-darker',
    darkest: 'luxury-darkest',
    foreground: 'luxury-foreground',
  },

  // Status Colors
  success: {
    lightest: 'success-lightest',
    lighter: 'success-lighter',
    light: 'success-light',
    main: 'success-main',
    dark: 'success-dark',
    darker: 'success-darker',
    darkest: 'success-darkest',
    foreground: 'success-foreground',
  },

  warning: {
    lightest: 'warning-lightest',
    lighter: 'warning-lighter',
    light: 'warning-light',
    main: 'warning-main',
    dark: 'warning-dark',
    darker: 'warning-darker',
    darkest: 'warning-darkest',
    foreground: 'warning-foreground',
  },

  error: {
    lightest: 'error-lightest',
    lighter: 'error-lighter',
    light: 'error-light',
    main: 'error-main',
    dark: 'error-dark',
    darker: 'error-darker',
    darkest: 'error-darkest',
    foreground: 'error-foreground',
  },

  // Neutral/Gray Colors
  neutral: {
    lightest: 'neutral-lightest',
    lighter: 'neutral-lighter',
    light: 'neutral-light',
    main: 'neutral-main',
    dark: 'neutral-dark',
    darker: 'neutral-darker',
    darkest: 'neutral-darkest',
    foreground: 'neutral-foreground',
  },

  // Semantic Colors
  background: {
    primary: 'background-primary',
    secondary: 'background-secondary',
    tertiary: 'background-tertiary',
  },

  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
    inverse: 'text-inverse',
  },

  border: {
    primary: 'border-primary',
    secondary: 'border-secondary',
    focus: 'border-focus',
  },
} as const;

/**
 * Common Class Combinations for UI Components
 */
export const COMMON_STYLES = {
  // Buttons
  primaryButton:
    'bg-primary-main active:bg-primary-dark text-primary-foreground',
  secondaryButton:
    'bg-secondary-lighter active:bg-secondary-light text-secondary-darkest',
  luxuryButton: 'bg-luxury-main active:bg-luxury-dark text-luxury-foreground',
  outlineButton: 'border border-primary-main bg-transparent text-primary-main',
  ghostButton: 'bg-transparent active:bg-neutral-lighter text-neutral-darkest',
  dangerButton: 'bg-error-main active:bg-error-dark text-error-foreground',

  // Cards
  card: 'bg-background-primary border border-neutral-light rounded-xl shadow-sm',
  elevatedCard: 'bg-background-primary rounded-xl shadow-lg',
  outlinedCard: 'bg-background-primary border border-neutral-light rounded-xl',

  // Text Hierarchy
  headingPrimary: 'text-2xl font-bold text-text-primary',
  headingSecondary: 'text-xl font-semibold text-text-primary',
  bodyText: 'text-base text-text-primary',
  bodyTextSecondary: 'text-base text-text-secondary',
  captionText: 'text-sm text-text-tertiary',
  inverseText: 'text-text-inverse',

  // Backgrounds
  screenBackground: 'bg-background-secondary',
  sectionBackground: 'bg-background-primary',
  subtleBackground: 'bg-background-tertiary',

  // Input Fields
  input:
    'border border-neutral-light rounded-lg px-4 py-3 text-text-primary bg-background-primary',
  inputFocused: 'border-primary-main',
  inputError: 'border-error-main text-error-main',
  inputSuccess: 'border-success-main text-success-main',

  // Status Indicators
  successBadge:
    'bg-success-lighter text-success-darkest border border-success-light',
  warningBadge:
    'bg-warning-lighter text-warning-darkest border border-warning-light',
  errorBadge: 'bg-error-lighter text-error-darkest border border-error-light',
  infoBadge:
    'bg-primary-lighter text-primary-darkest border border-primary-light',

  // Interactive States
  hover: 'active:opacity-80',
  pressed: 'active:scale-95',
  disabled: 'opacity-50',
  focus: 'border-border-focus',
} as const;

/**
 * Actual hex values for cases where NativeWind classes can't be used
 * (e.g., ActivityIndicator, StatusBar, etc.)
 */
export const HEX_COLORS = {
  primary: {
    lightest: '#fff7ed',
    lighter: '#ffedd5',
    light: '#fed7aa',
    main: '#f97316',
    dark: '#ea580c',
    darker: '#c2410c',
    darkest: '#9a3412',
    foreground: '#ffffff',
  },
  luxury: {
    main: '#a855f7',
    dark: '#9333ea',
    foreground: '#ffffff',
  },
  success: {
    lightest: '#dcfce7',
    lighter: '#bbf7d0',
    main: '#22c55e',
    dark: '#16a34a',
    foreground: '#ffffff',
  },
  warning: {
    lightest: '#fef3c7',
    lighter: '#fde68a',
    main: '#f59e0b',
    dark: '#d97706',
    foreground: '#ffffff',
  },
  error: {
    main: '#ef4444',
    foreground: '#ffffff',
  },
  neutral: {
    darkest: '#262626',
    foreground: '#ffffff',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },
} as const;
