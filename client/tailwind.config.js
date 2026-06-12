/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        dark: {
          900: '#0a0f0d',
          800: '#111813',
          700: '#1a2420',
          600: '#243028',
          500: '#2d3d34',
        }
      }
    }
  },
  plugins: []
};
