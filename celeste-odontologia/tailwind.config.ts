import type { Config } from 'tailwindcss';
import { site } from './src/config/site';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '!./src/admin/**'],
  theme: {
    extend: {
      colors: { ...site.colors, abyss: '#08192B' },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', 'Jost', 'system-ui', 'sans-serif']
      },
      letterSpacing: { eyebrow: '0.18em' },
      boxShadow: {
        glass: '0 20px 60px -24px rgb(6 18 32 / 0.65)',
        soft: '0 18px 50px -28px rgb(14 35 56 / 0.45)'
      }
    }
  },
  plugins: []
} satisfies Config;
