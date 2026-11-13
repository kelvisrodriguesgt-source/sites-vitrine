// Prepara o painel /admin (Decap CMS): copia o CMS para public/admin e gera o seed do modo demonstração
// a partir dos mesmos arquivos de conteúdo que o site usa (src/content/*.json).
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'node_modules/decap-cms/dist');
const out = resolve(root, 'public/admin');
mkdirSync(out, { recursive: true });

for (const name of readdirSync(dist)) {
  if (name === 'decap-cms.js' || /^\d+\.decap-cms\.js$/.test(name) || name.endsWith('.wasm')) {
    copyFileSync(resolve(dist, name), resolve(out, name));
  }
}

const content = {};
for (const file of ['products.json', 'info.json', 'texts.json']) {
  content[file] = { content: readFileSync(resolve(root, 'src/content', file), 'utf8') };
}
// O Decap lê o repositório de teste em window.repoFiles, na estrutura de pastas do repositório real.
const repoFiles = { 'brasa-burger': { src: { content } } };
writeFileSync(resolve(out, 'seed.js'), `window.repoFiles = ${JSON.stringify(repoFiles)};\n`);
console.log('Painel preparado em public/admin');
