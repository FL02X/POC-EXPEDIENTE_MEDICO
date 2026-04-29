/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gov-navy': '#0b3d91',
        'gov-gray': '#6B7280'
      }
    }
  },
  plugins: [],
};
