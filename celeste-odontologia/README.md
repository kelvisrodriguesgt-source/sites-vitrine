# Celeste Odontologia — site demonstrativo (Grupo KR)

Site de página única para clínica odontológica, no estilo "luxo clínico": azul-marinho, champagne, vidro fosco e títulos em serifa com itálico.
**Todos os dados são fictícios** (nome, endereço, telefone, equipe). Serve como portfólio e como base para sites de clientes.

Stack: React 19 + TypeScript + Vite + Tailwind. O build gera o HTML já renderizado (SEO) e os arquivos `robots.txt`, `sitemap.xml` e `llms.txt`.

## Comandos

```bash
npm install
npm run dev        # desenvolvimento (site em /, painel em /admin)
npm run build      # typecheck + build + pré-renderização
npm test           # Vitest: link do WhatsApp, SEO gerado, dados da configuração
npm run qa         # após o build: Playwright em 1366 e 390 px, menu, botões, imagens, SEO e painel /admin (login, navegação, edição refletida no site; screenshots em ./qa-out)
```

O `npm run qa` usa o Playwright instalado na raiz do repositório `sites-vitrine`. Se o Chromium estiver em outro caminho: `CHROMIUM_PATH=/caminho/chrome npm run qa`.

## Como adaptar para outra clínica

1. **Textos e dados**: edite os arquivos de `src/content/` (ou use o painel `/admin`, veja abaixo).
   - `info.json`: nome, segmento, WhatsApp (um número só, usado em todos os botões), telefone, Instagram, endereço, horários, caminhos das fotos.
   - `texts.json`: todos os textos das seções. Trechos entre `*asteriscos*` saem em itálico.
   - `treatments.json`: tratamentos (3 itens cada, foto e descrição).
   - `differentials.json`: diferenciais, números em destaque, tecnologia e passos de "Como funciona".
   - `team.json`: equipe. O campo `cro` só aparece se for preenchido. Nunca inventar registro profissional.
   - `faq.json`: perguntas frequentes.
2. **Cores e SEO**: `src/config/site.ts` (paleta, URL de produção, título, descrição, `indexable`, tipo do Schema).
3. **Fotos**: troque os arquivos em `public/img` mantendo os nomes.

   | Arquivo | Proporção | Tamanho sugerido |
   | --- | --- | --- |
   | `hero.webp` | 16:9 | 1920 px, até 250 KB |
   | `hero-mobile.webp` | 3:4 | 900 px, até 250 KB (enquadrar o rosto ao centro) |
   | `estetica`, `implantes`, `ortodontia`, `prevencao`, `tecnologia` (`.webp`) | 4:3 | 900 px, até 120 KB |
   | `recepcao.webp` | 16:9 | 1600 px (também é usada no og-image e no vídeo) |
   | `consultorio.webp` | 1:1 | 900 px (aparece em círculo) |
   | `cta-final.webp` | 16:9 | a recepção desfocada e escurecida |

   Depois de trocar `recepcao.webp` (ou o nome/cidade), rode `node scripts/make-brand-assets.mjs` para refazer `og-image.jpg` e os ícones.
4. **Vídeo**: o cartão de vídeo do topo abre um modal com um espaço reservado ("vídeo do cliente aqui"). Para um vídeo real, troque o conteúdo de `src/components/VideoModal.tsx` por um `<video>` hospedado no próprio site (a política de segurança bloqueia iframes de terceiros, exceto o mapa do Google).
5. **Mapa**: cole o link de incorporação do Google Maps em `address.mapEmbedSrc` (`info.json`). Vazio, aparece um espaço reservado.
6. **Números em destaque** (`differentials.json`, "highlights"): são marcadores de exemplo. Substitua por dado real do cliente; se não houver, troque por um diferencial sem número. Nunca inventar quantidade de pacientes nem percentuais.
7. **Versão final**: `seo.indexable: true`, remover a linha `X-Robots-Tag` do `vercel.json`, trocar `seo.url` pelo domínio do cliente, descomentar a verificação do Search Console (no `src/lib/seo.ts`), `brand.demo: false`.

## Conteúdo de saúde

Sem promessa de resultado, sem "garantimos", sem antes e depois, sem preços, sem diagnóstico e sem depoimentos ou avaliações inventadas. O Schema é `Dentist`, sem `aggregateRating`.

## Painel /admin (painel próprio)

Painel em português simples, nas cores do site, feito para quem não é da área: tela inicial com "O que você quer mudar hoje?", checklist "Para o site ficar pronto", e áreas para **Tratamentos** (adicionar, remover, reordenar, trocar foto), **Fotos do site**, **Contato e horários** (WhatsApp, endereço, mapa), **Equipe**, **Perguntas frequentes**, **Textos do site** e **Números e diferenciais**. Cada área tem barra "Salvar alterações", aviso de confirmação, "Voltar ao original" e validações (WhatsApp, link do mapa, tamanho das fotos).

**Modo demonstração:** a senha é `celeste123` (fica no código, não protege nada) e tudo é salvo no `localStorage` do navegador. O site e o painel, abertos no mesmo navegador, se atualizam na hora. Serve para mostrar ao cliente como seria editar; as alterações não valem para outros visitantes.

Código: `src/admin/` (telas), `src/shared/content.ts` (leitura, validação e gravação do conteúdo editado), `src/context/SiteContext.tsx` (o site lê o conteúdo salvo). Páginas em `admin/index.html` (build com várias páginas no Vite).

### Passar para edição real (cliente fechado)

1. Trocar `src/shared/storage.ts`/`content.ts` por chamadas a uma API própria (por exemplo, banco de dados com a mesma estrutura dos arquivos de `src/content/`).
2. Trocar o login de demonstração (`src/admin/config.ts`) por autenticação de verdade, com sessão no servidor.
3. Servir as fotos enviadas de um armazenamento (hoje elas são reduzidas e guardadas como WebP no navegador).
4. O mesmo conteúdo continua podendo ser editado diretamente em `src/content/*.json`.

## Segurança

`vercel.json` aplica CSP estrita (sem scripts nem estilos inline no site), `X-Frame-Options`, HSTS, `Referrer-Policy`, `Permissions-Policy` e `X-Robots-Tag: noindex` (protótipo). O `/admin` usa a mesma CSP estrita (o painel não usa estilos nem scripts inline). `public/.well-known/security.txt` indica o contato de segurança.
