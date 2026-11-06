import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* Contrato de arquitetura dos módulos do site, imposto de verdade nos imports de JavaScript.
 * (O arch-contract só analisa TypeScript e ignorou violações injetadas em .js; por isso a regra vive aqui.)
 *
 *  pure   -> não importa nada (lógica testável, sem DOM)
 *  config -> não importa nada
 *  dom    -> só pode importar pure
 *  entry  -> pode importar tudo */
const DIR = 'grupo-kr-motion/js';
const LAYERS = {
  'lib.js': 'pure',
  'consent.js': 'pure',
  'observability.js': 'pure',
  'config.js': 'config',
  'motion.js': 'dom',
  'tracking.js': 'dom',
  'main.js': 'entry',
  'boot.js': 'boot'
};
const MAY_DEPEND_ON = { pure: [], config: [], dom: ['pure'], entry: ['pure', 'config', 'dom'], boot: [] };

function importsOf(file) {
  const src = readFileSync(join(DIR, file), 'utf8');
  return [...src.matchAll(/^\s*import\s[^'"]*['"]\.\/([^'"]+)['"]/gm)].map((m) => m[1]);
}

describe('arquitetura em camadas', () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.js'));

  it('todo módulo pertence a uma camada declarada', () => {
    for (const f of files) expect(LAYERS, `${f} sem camada`).toHaveProperty([f]);
  });

  for (const file of files) {
    it(`${file} (${LAYERS[file]}) só importa camadas permitidas`, () => {
      const allowed = MAY_DEPEND_ON[LAYERS[file]];
      for (const target of importsOf(file)) {
        expect(allowed, `${file} não pode importar ${target}`).toContain(LAYERS[target]);
      }
    });
  }

  it('não há dependência circular', () => {
    const graph = Object.fromEntries(files.map((f) => [f, importsOf(f)]));
    const visiting = new Set();
    const done = new Set();
    const visit = (f, trail) => {
      if (done.has(f)) return;
      expect(visiting.has(f), `ciclo: ${[...trail, f].join(' -> ')}`).toBe(false);
      visiting.add(f);
      for (const t of graph[f] || []) visit(t, [...trail, f]);
      visiting.delete(f);
      done.add(f);
    };
    for (const f of files) visit(f, []);
  });
});
