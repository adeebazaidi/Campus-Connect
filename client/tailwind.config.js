/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#DDE3E8',
          plum: '#3A0F34',
          yellow: '#EAAA00',
          dark: '#3A0F34',
          light: '#DDE3E8',
          accent: '#EAAA00',
          border: '#3A0F34',
        },
        primary: {
          50: '#fcf8ee',
          100: '#faefd4',
          200: '#f4dea4',
          300: '#eccb6e',
          400: '#e5b838',
          500: '#EAAA00',
          600: '#c88f00',
          700: '#9f7000',
          800: '#755200',
          900: '#4d3600',
        },
        plum: {
          50: '#f6eff5',
          100: '#ebd9eb',
          200: '#dab3da',
          300: '#c289c2',
          400: '#7f2873',
          500: '#3A0F34',
          600: '#320d2d',
          700: '#280a24',
          800: '#1e081b',
          900: '#140512',
        },
        surface: {
          50: '#ffffff',
          100: '#f8fafb',
          200: '#edf2f6',
          300: '#DDE3E8',
          400: '#c5d0d8',
          500: '#a7b6c2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'neo-xs': '1.5px 1.5px 0px #3A0F34',
        'neo-sm': '2px 2px 0px #3A0F34',
        'neo': '3px 3px 0px #3A0F34',
        'neo-md': '4px 4px 0px #3A0F34',
        'neo-lg': '6px 6px 0px #3A0F34',
        'neo-yellow': '3px 3px 0px #EAAA00',
        'neo-yellow-md': '4px 4px 0px #EAAA00',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
