/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core background surfaces
        gym: {
          bg: '#0B0B0D',
          surface: '#141418',
          'surface-hover': '#1C1C22',
          border: '#2A2A32',
          'border-light': '#3A3A44',
        },
        // Accent – neon blue
        accent: {
          DEFAULT: '#00E5FF',
          hover: '#00C8E0',
          muted: 'rgba(0, 229, 255, 0.15)',
          glow: 'rgba(0, 229, 255, 0.25)',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        // Status
        status: {
          active: '#22C55E',
          'active-bg': 'rgba(34, 197, 94, 0.15)',
          expiring: '#F59E0B',
          'expiring-bg': 'rgba(245, 158, 11, 0.15)',
          expired: '#EF4444',
          'expired-bg': 'rgba(239, 68, 68, 0.15)',
          archived: '#71717A',
          'archived-bg': 'rgba(113, 113, 122, 0.15)',
          paid: '#22C55E',
          partial: '#F59E0B',
          pending: '#F59E0B',
          failed: '#EF4444',
          refunded: '#A78BFA',
          'refunded-bg': 'rgba(167, 139, 250, 0.15)',
        },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'Oswald', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 229, 255, 0.2)',
        card: '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)' },
        },
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        sidebar: '16rem',
        'sidebar-collapsed': '4.5rem',
      },
    },
  },
  plugins: [],
};
