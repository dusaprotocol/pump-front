/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%': { transform: 'translateX(0)', backgroundColor: 'yellow' },
          '10%': { transform: 'translateX(-10px)' },
          '20%': { transform: 'translateX(10px)', backgroundColor: 'purple' },
          '30%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)', backgroundColor: 'blue' },
          '50%': { transform: 'translateX(-10px)' },
          '60%': { transform: 'translateX(10px)', backgroundColor: 'green' },
          '70%': { transform: 'translateX(-10px)' },
          '80%': { transform: 'translateX(10px)', backgroundColor: 'red' },
          '90%': { transform: 'translateX(-10px)' },
          '100%': { transform: 'translateX(0)', backgroundColor: 'yellow' }
        },
        colorSwitch: {
          '0%': { color: '#FFD700' },
          '10%': { color: '#FFC300' },
          '20%': { color: '#B57EDC' },
          '30%': { color: '#A680D6' },
          '40%': { color: '#6495ED' },
          '50%': { color: '#6CA0DC' },
          '60%': { color: '#3CB371' },
          '70%': { color: '#5BBA77' },
          '80%': { color: '#CD5C5C' },
          '90%': { color: '#D46A6A' },
          '100%': { color: '#FFD700' }
        }
      },
      animation: {
        shake: 'shake 1s',
        colorSwitch: 'colorSwitch 2s infinite'
      }
    }
  },
  plugins: []
};
