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

        // Gold ramp — premium / achievement / financial accents (ratings,
        // best-seller ranks, distributor status). Never for buttons.
        gold: {
          50: '#FBF7EB',
          100: '#F5EDD8',
          200: '#EADDB4',
          300: '#DCC687',
          400: '#CFAE5C',
          500: '#C29A3F',
          600: '#A67F30',
          700: '#856426',
          800: '#5F481D',
          900: '#3D2E13',
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

        // Semantic states — status only, never decoration
        success: { DEFAULT: '#0E6B52', 50: '#E7F4EE', 100: '#CDE9DE', 600: '#0E6B52' },
        warning: { DEFAULT: '#C89D4D', 50: '#F8EFD9', 100: '#FEF3C7', 600: '#B4883A' },
        danger:  { DEFAULT: '#D9252A', 50: '#FCE8E8', 100: '#FEE2E2', 600: '#D9252A' },
        info:    { DEFAULT: '#123B6D', 50: '#F0F4F9', 100: '#E1E9F3', 600: '#123B6D' },
      },

      // Border-radius scale — intentional radii, not everything-is-a-pill.
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      // Shadows — quiet, layered; no glows
      boxShadow: {
        card:   '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        raised: '0 4px 12px rgba(16, 24, 40, 0.08)',
        overlay:'0 24px 48px rgba(16, 24, 40, 0.18)',
      },
    },
  },
  plugins: [],
}
