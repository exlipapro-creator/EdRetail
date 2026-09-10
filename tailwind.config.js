/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // EDRetail Brand Identity Core — values sampled from the canonical
        // logo assets (public/logo/wordmark.png, apple-touch-icon.png):
        //   navy ≈ #002958 ("EDR Navy"), red ≈ #9B0504 ("EDR Red").
        // Corroborated by manifest theme_color (#002858) and the animated
        // splash logo constants. Do not drift from these without re-sampling.
        brand: {
          navy: '#002958',
          'navy-dark': '#001F42',
          'navy-deep': '#00142B',
          'navy-light': '#E8EEF6',
          red: '#9B0504',
          'red-dark': '#7A0403',
          'red-light': '#FBECEC',
        },

        // Master Design System Primary -> Mapped directly to EDR Navy (logo #002958)
        primary: {
          50: '#EDF2F8',
          100: '#D9E4F0',
          200: '#B3C9E1',
          300: '#7FA3C9',
          400: '#4A77A8',
          500: '#093A6E',
          600: '#002958', // EDR Navy Brand Primary (logo)
          700: '#001F42', // EDR Navy Dark Pressed
          800: '#00152D', // EDR Navy Deep
          900: '#000B18',
          DEFAULT: '#002958',
          dark: '#001F42',
          light: '#EDF2F8',
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

        // Semantic states — status only, never decoration.
        // They intentionally share the brand red/navy/gold families so the
        // product has ONE coherent set of hues; role comes from context.
        success: { DEFAULT: '#0E6B52', 50: '#E7F4EE', 100: '#CDE9DE', 600: '#0E6B52', 700: '#0A5944', 800: '#07402F' },
        warning: { DEFAULT: '#B08A3E', 50: '#F8EFD9', 100: '#F3E7CC', 600: '#96702E' },
        danger:  { DEFAULT: '#9B0504', 50: '#FBECEC', 100: '#F5D5D5', 600: '#9B0504' },
        info:    { DEFAULT: '#002958', 50: '#EDF2F8', 100: '#D9E4F0', 600: '#002958' },
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
