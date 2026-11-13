import type { Config } from 'tailwindcss';
import { COLORS } from './src/config/site';

/** Configuração do painel /admin: mesmas cores e fontes do site, mas só varre os arquivos do painel. */
export default {
  content: ['./admin/index.html', './src/admin/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...COLORS, abyss: '#08192B', paper: '#F4F7FA' },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', 'Jost', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgb(14 35 56 / 0.05), 0 10px 28px -14px rgb(14 35 56 / 0.2)',
        pop: '0 24px 60px -20px rgb(8 25 43 / 0.6)'
      }
    }
  },
  plugins: []
} satisfies Config;
