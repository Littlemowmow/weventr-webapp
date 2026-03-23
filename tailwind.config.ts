import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0E0E0E',
        card: '#1A1A1A',
        raised: '#2A2A2A',
        border: '#3A3A3A',
        teal: {
          DEFAULT: '#0F4C5C',
          light: '#1A6B7A',
          dark: '#0A3641',
        },
        orange: {
          DEFAULT: '#FF7A3D',
          light: '#FF9A6C',
          dark: '#CC5F2E',
        },
        gold: {
          DEFAULT: '#FFCA2A',
          light: '#FFD966',
          dark: '#CCA020',
        },
        dim: '#636366',
        mid: '#8E8E93',
      },
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
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
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(15, 76, 92, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(15, 76, 92, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
