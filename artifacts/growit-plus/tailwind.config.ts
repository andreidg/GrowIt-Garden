/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#1A3C2E', light: '#2A5C47', dark: '#0D2018' },
        cream:  { DEFAULT: '#F5F0E8', dark: '#E8DFD1', light: '#FDFCFB' },
        terracotta: { DEFAULT: '#C4622D', light: '#D97A46', dark: '#A34E20' },
        frost:  { DEFAULT: '#A8C4D4', light: '#C4D9E4', dark: '#82A5B8' },
        gold:   { DEFAULT: '#D4A853', light: '#E6C27A', dark: '#B38A3D' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}