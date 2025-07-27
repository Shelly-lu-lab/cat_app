/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdecd3',
          200: '#fbd5a5',
          300: '#f8b76d',
          400: '#f59332',
          500: '#f2750a',
          600: '#e35a05',
          700: '#bc4208',
          800: '#95350e',
          900: '#782e0f',
        },
        cat: {
          orange: '#ff6b35',
          cream: '#f7f3e9',
          brown: '#8b4513',
          gray: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
} 