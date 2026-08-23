/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // EDRetail Brand Identity Core
        brand: {
          navy: '#123B6D',
          'navy-dark': '#0A2747',
          'navy-deep': '#0D315D',
          'navy-light': '#E8EEF5',
          red: '#D9252A',
          'red-dark': '#B71C1C',
          'red-light': '#FCE8E8',
        },

        // Master Design System Primary -> Mapped directly to EDR Navy
        primary: {
          50: '#F0F4F9',
          100: '#E1E9F3',
          200: '#C3D3E7',
          300: '#94B2D5',
          400: '#5F8DC0',
          500: '#123B6D', // EDR Navy Brand Primary
          600: '#123B6D', // EDR Navy
          700: '#0D315D', // EDR Navy Dark Pressed
          800: '#0A2747', // EDR Navy Deep
          900: '#06192E',
          DEFAULT: '#123B6D',
          dark: '#0A2747',
          light: '#F0F4F9',
        },

        // Wellness Experience Layer
        wellness: {
          emerald: '#0E6B52',
          deep: '#082F28',
          light: '#E7F4EE',
          mint: '#CDE9DE',
          DEFAULT: '#0E6B52',
        },

        // Achievement & Goals Gold Layer
        achievement: {
          gold: '#C89D4D',
          light: '#F8EFD9',
          DEFAULT: '#C89D4D',
        },

        // Neutral / surface system (70% foundation)
        neutral: {
          50: '#F6F7F8',
          100: '#F1F3F5',
          200: '#E1E5E8',
          300: '#CBD2D9',
          400: '#8D98A5',
          500: '#647181',
          600: '#485563',
          700: '#323E4C',
          800: '#1B2735',
          900: '#0E1722',
        },

        // Semantic states
        success: { DEFAULT: '#0E6B52', 50: '#E7F4EE', 100: '#CDE9DE', 600: '#0E6B52' },
        warning: { DEFAULT: '#C89D4D', 50: '#F8EFD9', 100: '#FEF3C7', 600: '#B4883A' },
        danger:  { DEFAULT: '#D9252A', 50: '#FCE8E8', 100: '#FEE2E2', 600: '#D9252A' },
        info:    { DEFAULT: '#123B6D', 50: '#F0F4F9', 100: '#E1E9F3', 600: '#123B6D' },
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


