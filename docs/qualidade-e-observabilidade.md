# Qualidade, testes e observabilidade — sites-vitrine

## Como rodar tudo

```bash
npm ci
npm run verify        # lint + código morto + testes com cobertura + e2e
npm run mutation      # testes de mutação (mais lento)
```

Se o Chromium já estiver instalado na máquina: `PW_CHROMIUM_PATH=/caminho/do/chrome npm run e2e`.

## Ferramentas

| Item | Ferramenta | Onde |
|---|---|---|
| Lint e formatação | Biome | `biome.json` |
| Mensagens de commit | commitlint (Conventional Commits) + hook `.githooks/commit-msg` | `commitlint.config.js` |
| Código e dependências sem uso | Knip (modo produção) | `knip.json` |
| Arquitetura em camadas | Teste de arquitetura no Vitest | `tests/unit/architecture.test.js` |
| Unitários e integração | Vitest + jsdom | `tests/unit/` |
| Mutação | Stryker | `stryker.config.mjs` |
| End-to-end, SEO e segurança | Playwright (desktop e celular) | `tests/e2e/` |
| Cobertura | Codecov (precisa do segredo `CODECOV_TOKEN` no GitHub) | `codecov.yml`, `.github/workflows/ci.yml` |

`arch-contract` foi avaliado e **não está em uso**: ele só analisa TypeScript e ignorou violações injetadas em arquivos `.js`.
A mesma regra de camadas (puro, DOM, entrada) é imposta pelo teste de arquitetura. Para usar o `arch-contract`, os módulos
teriam de migrar para TypeScript, com uma etapa de build.

## Observabilidade

Estado atual: coleta própria e mínima (erros de JavaScript e Web Vitals LCP/CLS) em `grupo-kr-motion/js/observability.js`.
**Fica desligada** até que (1) `OBSERVABILITY.endpoint` seja preenchido em `js/config.js` e (2) a pessoa aceite os cookies.
Envia só o caminho da página, sem query string.

Nenhum SDK de terceiro foi instalado: Sentry, Datadog, New Relic e OpenTelemetry exigem conta, chave e coletor próprios.
Para ligar qualquer um deles:

1. Criar a conta/projeto e obter a chave (DSN, client token ou applicationID).
2. Carregar o SDK somente depois do consentimento (no callback `onConsent` de `js/main.js`).
3. Liberar na política de segurança do `vercel.json` apenas os domínios do serviço escolhido (`script-src` e `connect-src`).
4. Atualizar a Política de Privacidade (item 4, compartilhamento) com o novo operador e a finalidade (monitoramento de erros e desempenho).
5. Conferir no Playwright que continua sem violação de CSP (`tests/e2e/seo-security.spec.js`).
