/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e2b714',
        text: '#d1d0c5',
        'text-dim': '#646669',
        background: '#323437',
        'background-secondary': '#2c2e31',
        correct: '#d1d0c5',
        incorrect: '#ca4754',
        border: '#646669',
      },
    },
  },
  plugins: [],
}
