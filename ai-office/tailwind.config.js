/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        washi: '#f3efe6',
        ink: '#2a261f',
        amber: {
          DEFAULT: '#a06a00',
          light: '#e0b64d',
        },
        success: '#2e6b3e',
        warn: '#b0433a',
      },
      fontFamily: {
        sans: [
          'Hiragino Kaku Gothic ProN',
          'Yu Gothic',
          'sans-serif',
        ],
        mincho: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
      },
      maxWidth: {
        app: '640px',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
