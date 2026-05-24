/** @type {import('tailwindcss').Config} */
const { colors } = require('./theme/colors')

module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors
      },
      fontFamily: {
        sans: ['Mukta-Regular'],
        'sans-medium': ['Mukta-Medium'],
        'sans-semibold': ['Mukta-SemiBold'],
        'sans-bold': ['Mukta-Bold'],
        'sans-extrabold': ['Mukta-ExtraBold'],
        crimson: ['CrimsonPro-Italic'],
        mono: ['SpaceMono-Regular'],
        'mono-bold': ['SpaceMono-Bold'],
      }
    },
  },
  plugins: [],
}
