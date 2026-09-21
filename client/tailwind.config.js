/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0b3b2a',
        primaryDark: '#0a2f22',
        textPrimary: '#0f172a',
        bgCard: '#fdfcf8',
        borderCard: '#e9e3d8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
