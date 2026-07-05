import type { Config } from 'tailwindcss';
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        primary:   '#7047D9', // violet — active states, links, highlights
        'primary-hover': '#5B32C7', // accessible small-text violet
        accent:    '#8800F3', // electric purple — CTA hover, AI moments, badges
        teal:      '#00ABAB', // success states, positive credit balance
        // Neutrals
        ink:       '#0A0E27', // deep navy — headlines, primary buttons, footer bg
        body:      '#1D1D1D', // body text
        muted:     '#6B7280', // muted text
        surface:   '#F7F7FB', // section backgrounds
        // Semantic
        success:   '#009A46',
        warning:   '#FF9B00',
        danger:    '#FF5805',
        // Legacy aliases kept for backward compat (will migrate gradually)
        secondary: '#7047D9',
        mist:      '#F7F7FB',
        feature: { DEFAULT: '#0A0E27', border: '#1E2545', text: '#E8E6F0', muted: '#9B97B8', dim: '#6B6890' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7047D9, #8800F3)',
        'cta-gradient':   'linear-gradient(135deg, #8800F3, #7047D9)',
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'var(--font-sora)', 'sans-serif'],
        sora:    ['var(--font-sora)', 'sans-serif'],
        inter:   ['var(--font-inter)', 'sans-serif'],
        mono:    ['var(--font-jbmono)', 'monospace'],
      },
      fontSize: {
        'hero':   ['clamp(2.25rem,5vw,4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':     ['2.5rem',   { lineHeight: '1.1',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3':     ['1.5rem',   { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg':['1.125rem', { lineHeight: '1.7' }],
        'body':   ['1rem',     { lineHeight: '1.65' }],
        'sm':     ['0.875rem', { lineHeight: '1.5' }],
        'xs':     ['0.8125rem',{ lineHeight: '1.4' }],
      },
      borderRadius: {
        'card':  '20px',
        'input': '12px',
        'btn':   '999px',
        '2xl':   '1.25rem',
        '3xl':   '1.75rem',
      },
      boxShadow: {
        // almost none — use 1px borders instead
        'float': '0 8px 30px rgba(10,14,39,0.08)',
        // legacy aliases
        'glass': '0 8px 30px rgba(10,14,39,0.08)',
        'glow':  '0 8px 24px rgba(112,71,217,0.22)',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        rise:    'rise 0.35s ease-out backwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
      transitionTimingFunction: { 'out': 'cubic-bezier(0,0,0.2,1)' },
      transitionDuration: { DEFAULT: '150ms', slow: '200ms' },
    },
  },
  plugins: [],
} satisfies Config;
