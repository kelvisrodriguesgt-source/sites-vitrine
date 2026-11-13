# Forno Nero Pizzaria (protótipo de site para pizzaria delivery)

React + TypeScript + Tailwind CSS, com HTML pré-renderizado no build (bom para SEO e carregamento rápido).
Todos os dados (nome, contatos, endereço, preços e promoções) são **fictícios e demonstrativos**.
Site de demonstração do Grupo KR. Enquanto for protótipo, não aparece no Google (`noindex`).

## Como transformar em outra pizzaria

1. Edite **`src/config/site.ts`**: cores, SEO (título, descrição, URL), categorias, regra do meio a meio,
   minijogo e imagens. Nome, contatos, endereço e horários ficam em `src/content/info.json`; cardápio em
   `src/content/products.json`; textos das seções em `src/content/texts.json`.
2. **WhatsApp:** uma única variável, `contact.whatsapp` (`src/content/info.json`), usada no pedido, nos botões de
   contato e no rodapé. A saudação do botão de contato fica em `contact.greeting`.
3. **Fotos:** as imagens atuais são **provisórias** (geradas por código, ilustrativas). Troque os arquivos em
   `public/img/` (webp, até ~200 KB) mantendo os nomes, ou ajuste os caminhos em `products.json`/`site.ts`.
   Produto sem `image` aparece com um bloco de marca no lugar da foto. O `hero.webp` é a pizza grande do topo
   e `pepperoni-1..6.webp` são os pepperonis flutuantes e do minijogo (fundo transparente).
   `scripts/make-placeholder-images.py` gera as provisórias; `scripts/make-brand-assets.mjs` gera favicon,
   apple-touch-icon e `og-image.jpg` (1200x630).
4. `npm run build`. O `<head>` (título, descrição, Open Graph, JSON-LD `Restaurant`), o `robots.txt`, o
   `sitemap.xml` e o `llms.txt` são gerados a partir da configuração.

### Tamanhos e meio a meio

- Pizzas têm preço por tamanho (P, M, G, com número de fatias). O card mostra "a partir de" o menor preço e
  passa a mostrar o preço exato quando o cliente escolhe o tamanho. Pizza com tamanho diferente é outro item
  no carrinho.
- **Meio a meio** (`halfAndHalf` em `site.ts`): o cliente escolhe dois sabores do mesmo tamanho. Regra de
  preço configurável: `pricing: 'highest'` (cobra o sabor mais caro, padrão) ou `'average'` (média).
  `categories` define quais categorias participam (por padrão, só `pizzas`). Na mensagem do WhatsApp aparece como
  `1x Pizza G meio a meio: Calabresa / Quatro Queijos`.
- Minijogo "Pegue o pepperoni": `game.enabled: false` remove a seção e o botão do topo. O código do jogo só é
  baixado quando o visitante abre o jogo, e o recorde fica no `localStorage`. Sem prêmio e sem bibliotecas.

## Versão final (depois da venda)

- `seo.indexable: true` e `seo.url` com o domínio real em `site.ts`.
- Remover a linha `X-Robots-Tag` do `vercel.json`.
- Descomentar a verificação do Search Console (comentário no `<head>` gerado em `src/lib/seo.ts`).
- `brand.demo: false` remove os avisos de demonstração e a identificação no pedido.
- Preencher `address.mapEmbedSrc` com o embed do Google Maps (o `frame-src` do CSP já libera `google.com`).
- Avaliações: preencher `reviews` e `googleReviewsUrl` em `site.ts` **somente com avaliações reais** e a fonte.
  Vazio, a seção mostra o convite para ver as avaliações do Google. Não há `aggregateRating` no JSON-LD.

## Comandos

```
npm install
npm run dev        # desenvolvimento
npm test           # testes (carrinho, tamanhos, meio a meio, WhatsApp, busca, SEO, jogo, painel)
npm run build      # typecheck + build + pré-renderização em dist/
npm run qa         # QA no navegador (precisa do build; CHROMIUM_PATH opcional): capturas em qa-screenshots/
```

## Pedido

O carrinho fica no navegador. Ao finalizar, o site monta uma mensagem organizada (itens com tamanho,
quantidades, valores, dados do cliente, troco quando for dinheiro e total) e abre o WhatsApp do número
configurado. Não há pagamento no site, e o pedido só vale depois que o cliente envia a mensagem e o atendimento
confirma. A taxa de entrega é informada pelo atendimento.

## Painel da loja (/admin)

O endereço `/admin` abre o painel da loja, nas cores do site. Senha de demonstração: `forno123` (definida em
`src/admin/config.ts`).

- **Dashboard:** faturamento, pedidos, ticket médio e pedidos em andamento (hoje, 7 e 30 dias, com comparação
  com o período anterior), gráfico por dia ou por hora, entrega x retirada, formas de pagamento e mais vendidos.
- **Pedidos:** lista por etapa (novo, em preparo, pronto/saiu para entrega, concluído, cancelado), busca,
  detalhes com histórico, avanço de status com um toque, cancelamento e cópia do resumo.
- **Produtos:** cardápio em cards: novo produto, editar, duplicar, excluir (com desfazer), categoria, descrição,
  selo, foto (enviada do computador/celular e reduzida automaticamente), **preço por tamanho (P/M/G e fatias)**
  ou preço único, e disponível/indisponível. O site muda na hora.
- **Configurações:** dados de exemplo (ligar/desligar), exportar pedidos em CSV, restaurar o cardápio original.

Este painel próprio substitui o Decap CMS (mesma abordagem do Brasa Burger): é mais simples para quem não é
técnico e funciona sem login em serviço externo.

### Como funciona hoje (modo demonstração)

Site e painel conversam pelo `localStorage` do **mesmo navegador** (`src/shared/`). Por isso:

- um pedido feito no site, no mesmo navegador, aparece no painel na hora (numeração a partir de #1001);
- o painel traz 30 dias de vendas fictícias para o dashboard fazer sentido (desligáveis nas Configurações);
- **pedidos de clientes em outros aparelhos não chegam ao painel**, e o cardápio editado só vale neste navegador;
- a senha fica no código da página: mostra a tela de login, mas **não protege dados de verdade**.

### Versão real

Trocar a camada `src/shared/` (storage, ordersStore, catalog) por chamadas a uma API: banco de dados online
(pedidos e cardápio), login real com sessão no servidor, recebimento dos pedidos do site e aviso ao atendente.
As telas continuam as mesmas. O painel é uma segunda entrada do Vite (`admin/index.html`), com CSS próprio
(`tailwind.admin.config.ts`), e tem a mesma política de segurança (CSP) estrita do site. Não é indexado (noindex).

## Segurança e SEO

`vercel.json` define `X-Robots-Tag: noindex, nofollow` (protótipo), CSP estrita (sem scripts nem estilos
inline), HSTS, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. Por isso o HTML nunca usa o
atributo `style`: use classes do Tailwind. Há um único H1 (com "Pizzaria delivery em Cidade Exemplo"), imagens
com `alt`, `width` e `height`, imagem principal com `fetchpriority="high"` e as demais com carregamento
preguiçoso. O parallax dos pepperonis é desligado com `prefers-reduced-motion`.
