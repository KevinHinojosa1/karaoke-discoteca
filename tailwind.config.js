/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          lavender: '#E4D9FF',
          pink: '#FFD6E8',
          mint: '#D3F8E2',
          sky: '#D6EFFF',
          yellow: '#FFF3C4',
          lavenderDark: '#8A6FC8',
          pinkDark: '#D46A98',
          mintDark: '#4AA674',
          skyDark: '#4A8BB5',
          yellowDark: '#C79A2B',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.05)',
          'surface-hover': 'rgba(255, 255, 255, 0.09)',
          'surface-active': 'rgba(255, 255, 255, 0.14)',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-highlight': 'rgba(255, 255, 255, 0.3)',
          card: 'rgba(18, 20, 36, 0.65)',
        },
        night: {
          base: '#080811',
          card: '#0f1123',
          card2: '#161932',
          surface: '#1c1f3d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'liquid': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'liquid-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'liquid-lg': '0 20px 50px 0 rgba(0, 0, 0, 0.5), inset 0 1px 2px 0 rgba(255, 255, 255, 0.35)',
        'glow-lavender': '0 0 25px rgba(228, 217, 255, 0.35)',
        'glow-pink': '0 0 25px rgba(255, 214, 232, 0.35)',
        'glow-mint': '0 0 25px rgba(211, 248, 226, 0.35)',
        'glow-sky': '0 0 25px rgba(214, 239, 255, 0.35)',
      },
      animation: {
        'blob': 'blob 14s infinite ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.15)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
