
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1A3C2E',
          light: '#2A5C47',
          dark: '#0D2018'
        },
        cream: {
          DEFAULT: '#F5F0E8',
          dark: '#E8DFD1',
          light: '#FDFCFB'
        },
        terracotta: {
          DEFAULT: '#C4622D',
          light: '#D97A46',
          dark: '#A34E20'
        },
        frost: {
          DEFAULT: '#A8C4D4',
          light: '#C4D9E4',
          dark: '#82A5B8'
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#E6C27A',
          dark: '#B38A3D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      backgroundImage: {
        'texture': 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
      }
    },
  },
  plugins: [],
}
