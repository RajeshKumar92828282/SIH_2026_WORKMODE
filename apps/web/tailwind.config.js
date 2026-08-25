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
        background: '#003247',
        surface: '#002b3d',
        border: 'rgba(135, 214, 235, 0.25)',
        brand: {
          blue: '#3b82f6',
          green: '#00c853',
          purple: '#8b5cf6',
          amber: '#ffd600',
          red: '#ff5252',
          cyan: '#87D6EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Geist', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
