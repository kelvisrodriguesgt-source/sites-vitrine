import type { Config } from 'tailwindcss';
import { site } from './src/config/site';

/** Configuração do painel /admin: mesmas cores e fontes do site, mas só varre os arquivos do painel. */
export default {
  content: ['./admin/index.html', './src/admin/**/*.{ts,tsx}', './src/components/Logo.tsx'],
  theme: {
    extend: {
      colors: { ...site.colors, paper: '#FAF6EA' },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        heading: ['"Montserrat Variable"', 'Montserrat', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgb(33 23 21 / 0.06), 0 8px 24px -12px rgb(33 23 21 / 0.18)',
        pop: '0 24px 60px -20px rgb(33 23 21 / 0.55)'
      }
    }
  },
  plugins: []
} satisfies Config;
