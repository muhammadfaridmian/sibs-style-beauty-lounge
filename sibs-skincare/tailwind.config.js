/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ed64a6",
        gold: "#c5a059",
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}