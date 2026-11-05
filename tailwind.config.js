/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf0',
          100: '#fbf5db',
          200: '#f7ebb5',
          300: '#f1db84',
          400: '#e9c54e',
          500: '#d4af37', // Classic metallic gold
          600: '#b88d27',
          700: '#936a21',
          800: '#795321',
          900: '#674420',
          950: '#3c230e',
        },
        luxury: {
          dark: '#0c0e14',
          card: '#141824',
          border: '#23293c',
          muted: '#8e98b0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'gold-sm': '0 0 10px -2px rgba(212, 175, 55, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 8px 40px 0 rgba(212, 175, 55, 0.15)',
        'glass-modal': '0 24px 64px 0 rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
