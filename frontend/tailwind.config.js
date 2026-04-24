/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Clash Display', 'Syne', 'sans-serif'],
        body: ['Cabinet Grotesk', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#060608',
        ink: '#0d0d14',
        slate: '#141420',
        mist: '#1e1e2e',
        ember: { DEFAULT: '#e85d26', light: '#f07848', dim: '#7a2e10' },
        plasma: { DEFAULT: '#7c3aed', light: '#9f67f5', dim: '#3b1a7a' },
        gold: { DEFAULT: '#c9a84c', light: '#e8c870', dim: '#6b561e' },
        neon: { DEFAULT: '#00ff87', dim: '#004d28' },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 12s ease-in-out infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        aurora: { '0%,100%': { 'background-position': '0% 50%' }, '50%': { 'background-position': '100% 50%' } },
        grain: { '0%,100%': { transform: 'translate(0,0)' }, '10%': { transform: 'translate(-2%,-3%)' }, '30%': { transform: 'translate(3%,-1%)' }, '50%': { transform: 'translate(-1%,2%)' }, '70%': { transform: 'translate(2%,1%)' }, '90%': { transform: 'translate(-3%,3%)' } },
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 40% 20%, hsla(260,70%,20%,0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(25,80%,25%,0.4) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(180,60%,10%,0.3) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
