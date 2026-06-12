/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Teal "constellation" brand — matches the bull/bear artwork
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        // Near-black with a blue cast
        dark: {
          900: '#02070b',
          800: '#071018',
          700: '#0d1822',
          600: '#15222e',
          500: '#1d2f3d',
        }
      }
    }
  },
  plugins: []
};
