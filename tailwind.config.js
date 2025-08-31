/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Orange)
        primary: {
          lightest: '#fff7ed', // For very subtle backgrounds
          lighter: '#ffedd5', // For light backgrounds
          light: '#fed7aa', // For hover states on light elements
          main: '#f97316', // Main brand color
          dark: '#ea580c', // For hover states
          darker: '#c2410c', // For active states
          darkest: '#9a3412', // For text on light backgrounds
          foreground: '#ffffff', // Text color on primary backgrounds
        },

        // Secondary Colors (Neutral/Gray)
        secondary: {
          lightest: '#f8fafc',
          lighter: '#f1f5f9',
          light: '#e2e8f0',
          main: '#64748b',
          dark: '#475569',
          darker: '#334155',
          darkest: '#1e293b',
          foreground: '#ffffff',
        },

        // Accent Colors (Warm/Amber)
        accent: {
          lightest: '#fffbeb',
          lighter: '#fef3c7',
          light: '#fde68a',
          main: '#f59e0b',
          dark: '#d97706',
          darker: '#b45309',
          darkest: '#92400e',
          foreground: '#ffffff',
        },

        // Luxury Colors (Purple)
        luxury: {
          lightest: '#faf5ff',
          lighter: '#f3e8ff',
          light: '#e9d5ff',
          main: '#a855f7',
          dark: '#9333ea',
          darker: '#7c3aed',
          darkest: '#6b21a8',
          foreground: '#ffffff',
        },

        // Success Colors (Green)
        success: {
          lightest: '#f0fdf4',
          lighter: '#dcfce7',
          light: '#bbf7d0',
          main: '#22c55e',
          dark: '#16a34a',
          darker: '#15803d',
          darkest: '#166534',
          foreground: '#ffffff',
        },

        // Warning Colors (Amber)
        warning: {
          lightest: '#fffbeb',
          lighter: '#fef3c7',
          light: '#fde68a',
          main: '#f59e0b',
          dark: '#d97706',
          darker: '#b45309',
          darkest: '#92400e',
          foreground: '#ffffff',
        },

        // Error Colors (Red)
        error: {
          lightest: '#fef2f2',
          lighter: '#fee2e2',
          light: '#fecaca',
          main: '#ef4444',
          dark: '#dc2626',
          darker: '#b91c1c',
          darkest: '#991b1b',
          foreground: '#ffffff',
        },

        // Neutral Colors (Enhanced Gray Scale)
        neutral: {
          lightest: '#fafafa',
          lighter: '#f5f5f5',
          light: '#e5e5e5',
          main: '#737373',
          dark: '#525252',
          darker: '#404040',
          darkest: '#262626',
          foreground: '#ffffff',
        },

        // Background Colors
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },

        // Text Colors
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
        },

        // Border Colors
        border: {
          primary: '#e5e7eb',
          secondary: '#d1d5db',
          focus: '#f97316',
        },
      },
    },
  },
  plugins: [],
};
