import type { Config } from 'tailwindcss';
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'rich-black': '#021B1A',
        'dark-green': '#032221',
        'bangladesh-green': '#03624C',
        'mountain-meadow': '#2CC295',
        'caribbean-green': '#00DF81',
        'anti-flash-white': '#F1F7F6',

        // Secondary palette
        pine: '#06302B',
        basil: '#08453A',
        forest: '#095544',
        frog: '#17876D',
        mint: '#2FA98C',
        stone: '#707D7D',
        pistachio: '#AACBC4',

        // Semantic
        success: '#00DF81',
        warning: '#E8B33C',
        danger: '#FF6B5B',
        info: '#2CC295',

        // Existing aliases so old classes still render while pages migrate
        primary: '#00DF81',
        secondary: '#2CC295',
        accent: '#03624C',
        teal: '#2CC295',
        ink: '#021B1A',
        body: '#F1F7F6',
        muted: '#AACBC4',
        surface: '#032221',
        mist: '#032221',
        feature: { DEFAULT: '#06302B', border: '#17876D', text: '#F1F7F6', muted: '#AACBC4', dim: '#707D7D' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #03624C, #00DF81)',
        'ai-gradient': 'linear-gradient(135deg, #00DF81, #2CC295)',
        'orb-1': 'radial-gradient(ellipse at center, rgba(0,223,129,0.22) 0%, rgba(0,223,129,0) 70%)',
        'orb-2': 'radial-gradient(ellipse at center, rgba(44,194,149,0.2) 0%, rgba(44,194,149,0) 70%)',
      },
      fontFamily: {
        heading: ['var(--font-unbounded)', 'sans-serif'],
        body: ['var(--font-hanken)', 'sans-serif'],
        sora: ['var(--font-unbounded)', 'sans-serif'],
        inter: ['var(--font-hanken)', 'sans-serif'],
        mono:    ['var(--font-jbmono)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(2.75rem,5.8vw,3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '1.15', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.3', fontWeight: '500' }],
        'stat': ['clamp(2.25rem,4vw,3rem)', { lineHeight: '1.1', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'micro': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '500' }],
      },
      borderRadius: {
        'card':  '20px',
        'input': '12px',
        'btn':   '999px',
        '2xl':   '1.25rem',
        '3xl':   '1.75rem',
      },
      boxShadow: {
        float: '0 8px 30px rgba(10,14,39,0.08)',
        glass: '0 8px 40px rgba(0,0,0,0.45)',
        glow: '0 0 40px rgba(0,223,129,0.35)',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        orb: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-12px,0)' } },
      },
      animation: {
        rise:    'rise 0.3s ease-out backwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        orb: 'orb 12s ease-in-out infinite',
      },
      transitionTimingFunction: { 'out': 'cubic-bezier(0,0,0.2,1)' },
      transitionDuration: { DEFAULT: '150ms', slow: '200ms' },
    },
  },
  plugins: [],
} satisfies Config;
