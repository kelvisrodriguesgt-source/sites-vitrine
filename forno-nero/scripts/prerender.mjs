// Gera o HTML estático da página (SEO e carregamento rápido) a partir do build SSR.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'dist/index.html');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const template = readFileSync(htmlPath, 'utf8');
if (!template.includes('<!--app-->')) throw new Error('Marcador <!--app--> não encontrado em dist/index.html');
writeFileSync(htmlPath, template.replace('<!--app-->', render()));
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log('Prerender concluído: dist/index.html');
