/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'team-blue': {
          50: '#e6f0ff',
          100: '#bdd6ff',
          200: '#94bbff',
          300: '#6ba0ff',
          400: '#4285ff',
          500: '#1a6aff',
          600: '#155bd8',
          700: '#104cb1',
          800: '#0b3c8a',
          900: '#062d63',
        },
        'team-red': {
          50: '#ffe6e6',
          100: '#ffbdbd',
          200: '#ff9494',
          300: '#ff6b6b',
          400: '#ff4242',
          500: '#ff1a1a',
          600: '#d81515',
          700: '#b11010',
          800: '#8a0b0b',
          900: '#630606',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.1), 0 0 10px rgba(245, 158, 11, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.2), 0 0 30px rgba(245, 158, 11, 0.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};