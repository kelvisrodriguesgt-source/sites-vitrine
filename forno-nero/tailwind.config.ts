import type { Config } from 'tailwindcss';
import { site } from './src/config/site';

export default {
  // O painel (/admin) tem a própria configuração e folha de estilos.
  content: ['./index.html', './src/**/*.{ts,tsx}', '!./src/admin/**'],
  theme: {
    extend: {
      colors: { ...site.colors },
      fontFamily: {
        display: ['"Unbounded Variable"', 'Unbounded', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: { card: '0 18px 40px -18px rgb(0 0 0 / 0.8)' }
    }
  },
  plugins: []
} satisfies Config;
