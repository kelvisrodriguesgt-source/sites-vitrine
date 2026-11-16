import type { Config } from 'tailwindcss';
import { site } from './src/config/site';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...site.colors },
      fontFamily: {
        // Títulos principais
        display: ['"Cormorant Garamond Variable"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        // Títulos secundários
        serif: ['"Playfair Display Variable"', '"Playfair Display"', 'Georgia', 'serif'],
        // Textos e navegação
        sans: ['"Montserrat Variable"', 'Montserrat', 'system-ui', 'sans-serif'],
        // Botões e elementos funcionais
        ui: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 24px 48px -28px rgb(41 36 33 / 0.35)',
        lift: '0 30px 60px -30px rgb(41 36 33 / 0.45)'
      }
    }
  },
  plugins: []
} satisfies Config;
