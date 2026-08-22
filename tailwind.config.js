/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Master Design System Primary
        primary: {
          50: '#F5F3FF',
          100: '#EFEDFF',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#818CF8',
          500: '#4F46E5',
          600: '#3827C5', // Master design system primary
          700: '#251C82', // Primary dark (pressed state)
          800: '#1E1766',
          900: '#140E48',
          DEFAULT: '#3827C5',
          dark: '#251C82',
          light: '#EFEDFF',
        },

        // Master Design System Secondary & Accent
        secondary: {
          green: '#087C61',
          DEFAULT: '#087C61',
        },
        accent: {
          orange: '#FF9D0B',
          DEFAULT: '#FF9D0B',
        },

        // Neutral / surface system
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Semantic states
        success: { DEFAULT: '#168A52', 50: '#F0FDF4', 100: '#DCFCE7', 600: '#168A52' },
        warning: { DEFAULT: '#F59E0B', 50: '#FFFBEB', 100: '#FEF3C7', 600: '#D97706' },
        danger:  { DEFAULT: '#E53935', 50: '#FEF2F2', 100: '#FEE2E2', 600: '#DC2626' },
        info:    { DEFAULT: '#1677A8', 50: '#F0F9FF', 100: '#E0F2FE', 600: '#0284C7' },

        // Legacy royal — kept for backward compatibility
        royal: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

