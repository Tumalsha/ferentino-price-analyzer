/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E12726',
          redDark: '#C41E1E',
          dark: '#14141C',
        },
      },
    },
  },
  plugins: [],
};
