/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a202c',
        'dark-card': '#2d3748',
        'dark-border': '#4a5568',
      }
    },
  },
  plugins: [],
}
