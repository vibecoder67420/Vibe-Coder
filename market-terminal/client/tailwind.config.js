/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          card: 'var(--card)',
          border: 'var(--border)',
          text: 'var(--text)',
          'text-secondary': 'var(--text-secondary)',
          green: '#00c896',
          red: '#ff4560',
          accent: '#6366f1',
          energy: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'DM Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
