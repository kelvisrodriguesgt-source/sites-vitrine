import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { site } from './src/config/site';
import { buildHead, buildLlms, buildRobots, buildSitemap } from './src/lib/seo';

/** Gera head de SEO, robots.txt, sitemap.xml e llms.txt a partir de src/config/site.ts. */
function seoFromConfig(): Plugin {
  return {
    name: 'seo-from-config',
    transformIndexHtml: (html) => html.replace('<!--head-seo-->', buildHead(site)),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots(site) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(site) });
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlms(site) });
    }
  };
}

export default defineConfig({
  plugins: [react(), seoFromConfig()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // Duas páginas: o site (index.html) e o painel (/admin), cada uma com o próprio CSS.
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), admin: resolve(__dirname, 'admin/index.html') } }
  }
});
