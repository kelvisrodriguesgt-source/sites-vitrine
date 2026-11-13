import type { Config } from 'tailwindcss';
import { site } from './src/config/site';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...site.colors },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        heading: ['"Montserrat Variable"', 'Montserrat', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: { card: '0 10px 30px -12px rgb(33 23 21 / 0.35)' }
    }
  },
  plugins: []
} satisfies Config;
