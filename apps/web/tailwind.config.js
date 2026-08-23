/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111827',
        border: '#1f2937',
        brand: {
          blue: '#3b82f6',
          green: '#10b981',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4'
        }
      }
    },
  },
  plugins: [],
};
