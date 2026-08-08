/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        action: {
          DEFAULT: 'rgb(var(--color-action) / <alpha-value>)',
          hover: 'rgb(var(--color-action-hover) / <alpha-value>)',
        },
        ink: {
          50: 'rgb(var(--color-ink-50) / <alpha-value>)',
          100: 'rgb(var(--color-ink-100) / <alpha-value>)',
          200: 'rgb(var(--color-ink-200) / <alpha-value>)',
          300: 'rgb(var(--color-ink-300) / <alpha-value>)',
          400: 'rgb(var(--color-ink-400) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
          200: 'rgb(var(--color-accent-200) / <alpha-value>)',
          300: 'rgb(var(--color-accent-300) / <alpha-value>)',
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700) / <alpha-value>)',
          800: 'rgb(var(--color-accent-800) / <alpha-value>)',
          900: 'rgb(var(--color-accent-900) / <alpha-value>)',
        },
        emerald: {
          50: 'rgb(var(--color-emerald-50) / <alpha-value>)',
          500: 'rgb(var(--color-emerald-500) / <alpha-value>)',
          600: 'rgb(var(--color-emerald-600) / <alpha-value>)',
          700: 'rgb(var(--color-emerald-700) / <alpha-value>)',
        },
        amber: {
          50: 'rgb(var(--color-amber-50) / <alpha-value>)',
          400: 'rgb(var(--color-amber-400) / <alpha-value>)',
          500: 'rgb(var(--color-amber-500) / <alpha-value>)',
          700: 'rgb(var(--color-amber-700) / <alpha-value>)',
        },
        red: {
          50: 'rgb(var(--color-red-50) / <alpha-value>)',
          100: 'rgb(var(--color-red-100) / <alpha-value>)',
          500: 'rgb(var(--color-red-500) / <alpha-value>)',
          600: 'rgb(var(--color-red-600) / <alpha-value>)',
          700: 'rgb(var(--color-red-700) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
};
