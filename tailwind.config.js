/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  safelist: [
    // Colors
    'from-amber-300',
    'to-amber-500',
    'from-blue-300',
    'to-blue-500',
    'bg-amber-500',
    'bg-amber-300',
    'bg-amber-600',
    'bg-amber-400/20',
    'text-amber-100',
    'text-amber-400',
    'text-amber-500',
    'bg-blue-500',
    'bg-blue-300',
    'bg-blue-600',
    'bg-blue-400/20',
    'text-blue-100',
    'text-blue-400',
    'text-blue-500',
    'hover:bg-amber-600',
    'hover:bg-blue-600',
    'focus:ring-amber-500',
    'focus:ring-blue-500',
    'bg-amber-500/20',
    'bg-blue-500/20',
    'bg-amber-500/30',
    'bg-blue-500/30',
    'bg-amber-500/80',
    'bg-blue-500/80',
    
    // Parameter slider specific colors
    'slider-amber',
    'slider-blue',
  ],
  plugins: [],
};