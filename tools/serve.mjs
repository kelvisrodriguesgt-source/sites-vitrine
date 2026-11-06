/* Servidor estático para testes: aplica os cabeçalhos do vercel.json do site e as URLs limpas (/privacidade).
 * Uso: node tools/serve.mjs <pasta-do-site> <porta> */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

export function loadHeaders(root) {
  const file = join(root, 'vercel.json');
  if (!existsSync(file)) return [];
  const cfg = JSON.parse(readFileSync(file, 'utf8'));
  return (cfg.headers || []).filter((r) => r.source === '/(.*)').flatMap((r) => r.headers);
}

export function resolveFile(root, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, clean);
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!extname(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

export function startServer(rootArg, port) {
  const root = resolve(rootArg);
  const headers = loadHeaders(root);
  return createServer((req, res) => {
    const file = resolveFile(root, req.url);
    for (const h of headers) res.setHeader(h.key, h.value);
    if (!file) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream');
    res.end(readFileSync(file));
  }).listen(port, '127.0.0.1');
}

if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) {
  const [, , dir, port] = process.argv;
  startServer(dir, Number(port));
}
