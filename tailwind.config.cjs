/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      backgroundColor: {
        default: '#000',
      },
      textColor: {
        default: '#fff',
      },
    },
  },
  variants: {},
  plugins: [],
};
