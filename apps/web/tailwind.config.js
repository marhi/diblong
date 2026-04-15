/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070608',
          900: '#0c0b0f',
          850: '#111018',
          800: '#16141f',
        },
        gold: {
          300: '#f2e6c7',
          400: '#e6cf96',
          500: '#d4b57a',
          600: '#b89455',
        },
      },
      fontFamily: {
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 60px rgba(0,0,0,0.45)',
        glow: '0 0 0 1px rgba(212,181,122,0.25), 0 20px 60px rgba(0,0,0,0.55)',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
