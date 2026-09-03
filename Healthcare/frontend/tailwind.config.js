/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#070C18',
          card: '#0B1528',
          border: '#152442',
          cyan: '#00F0FF',
          rose: '#F43F5E',
          amber: '#F59E0B',
          emerald: '#10B981'
        }
      }
    },
  },
  plugins: [],
}

