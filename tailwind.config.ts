import type { Config } from 'tailwindcss';
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED', secondary: '#FF6B2C', accent: '#38BDF8', success: '#10B981',
        ink: '#0F172A', mist: '#F8FAFC',
        // premium "featured" surface — used sparingly for the one highlighted
        // card/section per screen (Pro plan, current plan, etc.)
        feature: { DEFAULT: '#1C1730', border: '#2E2750', text: '#D8D2F0', muted: '#A89FCB', dim: '#8A80AD' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #FF6B2C, #7C3AED)',
      },
      fontFamily: { sora: ['var(--font-sora)'], inter: ['var(--font-inter)'], mono: ['var(--font-jbmono)'] },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: { glass: '0 10px 40px rgba(15,23,42,.08)', glow: '0 8px 32px rgba(124,58,237,.35)' },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { rise: 'rise .5s ease backwards' },
    },
  },
  plugins: [],
} satisfies Config;
