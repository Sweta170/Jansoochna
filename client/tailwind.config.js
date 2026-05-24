/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jan: {
          green: '#1D9E75',
          'green-lt': '#E1F5EE',
          'green-dk': '#085041',
          amber: '#BA7517',
          'amber-lt': '#FAEEDA',
          red: '#D85A30',
          'red-lt': '#FAECE7',
          text: '#1a1a1a',
          muted: '#6b7280',
          border: '#e5e7eb',
          surface: '#f9fafb',
          white: '#ffffff',
        }
      },
      fontFamily: {
        mukta: ['Mukta', 'sans-serif'],
        noto: ['Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
