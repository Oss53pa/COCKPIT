/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grayscale - Thème professionnel monochrome
        primary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Couleurs de statut
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Niveaux de sévérité
        severity: {
          low: '#6b7280',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#7f1d1d',
        },
        // Couleurs des axes stratégiques
        axe: {
          finance: '#3b82f6',
          operations: '#10b981',
          gouvernance: '#8b5cf6',
          developpement: '#f97316',
          leadership: '#ec4899',
          stakeholders: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Exo 2', 'system-ui', 'sans-serif'],
        display: ['Grand Hotel', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        focus: '0 0 0 3px rgba(23,23,23,0.1)',
      },
    },
  },
  plugins: [],
};
