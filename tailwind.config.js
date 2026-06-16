/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // indigo-600
        'primary-light': '#EEF2FF', // indigo-50
        'primary-dark': '#4338CA', // indigo-700
        secondary: '#0EA5E9', // sky-500
        surface: '#FFFFFF',
        background: '#F8FAFC', // slate-50
        'gray-soft': '#F1F5F9', // slate-100
        'gray-mid': '#94A3B8', // slate-400
        'text-dark': '#1E293B', // slate-800
        'text-muted': '#64748B', // slate-500
        success: '#10B981', // emerald-500
        warning: '#F59E0B', // amber-500
        danger: '#EF4444', // red-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'cell-fill': 'cellFill 0.08s ease-in forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'count-up': 'countUp 0.6s ease-out forwards',
        'pulse-primary': 'pulsePrimary 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        cellFill: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulsePrimary: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(79, 70, 229, 0)' },
        },
      },
      backgroundImage: {
        'diagonal-pattern': "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(79, 70, 229, 0.03) 40px, rgba(79, 70, 229, 0.03) 80px)",
        'grid-pattern': "linear-gradient(rgba(79, 70, 229, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.05) 1px, transparent 1px)",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
