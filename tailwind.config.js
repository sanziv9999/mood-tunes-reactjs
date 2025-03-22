/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6B7280',
        secondary: '#8B5CF6',
        highlight: '#FBBF24',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out',
        'fade-in-right': 'fadeInRight 1s ease-out',
        'wave': 'wave 20s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(-30px)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};