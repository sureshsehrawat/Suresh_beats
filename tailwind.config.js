/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, 1rem)'
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, 0)'
          }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.2s ease-out'
      }
    },
  },
  plugins: [],
}
