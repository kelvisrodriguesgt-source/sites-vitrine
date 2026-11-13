# Brasa Burger (protótipo de site para hamburgueria)

React + TypeScript + Tailwind CSS, com HTML pré-renderizado no build (bom para SEO e carregamento rápido).
Todos os dados são **fictícios e demonstrativos**.

## Como transformar em outra hamburgueria

1. Edite **`src/config/site.ts`**: nome, cores, telefone, WhatsApp (uma única variável: `contact.whatsapp`),
   endereço, horários, categorias, produtos, preços, textos, fotos e dados de SEO.
2. Troque as fotos em `public/img/` (webp, até ~200 KB cada) e ajuste os caminhos no mesmo arquivo.
   Produto sem `image` aparece com um bloco de marca no lugar da foto.
3. Gere novas `public/og-image.jpg` (1200x630), `public/favicon.png` (512x512) e `public/apple-touch-icon.png`.
4. Rode `npm run build`. O `<head>` (título, descrição, Open Graph, JSON-LD), o `robots.txt`, o `sitemap.xml`
   e o `llms.txt` são gerados a partir do `site.ts`.

## Versão final (depois da venda)

- `seo.indexable: true` e `seo.url` com o domínio real em `site.ts`.
- Remover a linha `X-Robots-Tag` do `vercel.json`.
- Descomentar a verificação do Search Console (comentário no `<head>` gerado em `src/lib/seo.ts`).
- `brand.demo: false` remove os avisos de dados demonstrativos e da mensagem do pedido.
- Preencher `address.mapEmbedSrc` com o embed do Google Maps (o `frame-src` do CSP já libera `google.com`).

## Comandos

```
npm install
npm run dev        # desenvolvimento
npm test           # testes (carrinho, mensagem do WhatsApp, SEO, catálogo)
npm run build      # typecheck + build + pré-renderização em dist/
```

## Pedido

O carrinho fica no navegador. Ao finalizar, o site monta uma mensagem organizada (itens, quantidades, valores,
dados do cliente e total) e abre o WhatsApp do número configurado. Não há pagamento no site, e o pedido só vale
depois que o cliente envia a mensagem e o atendimento confirma. A taxa de entrega é informada pelo atendimento.

## Painel de edição (/admin)

O endereço `/admin` abre um painel (Decap CMS, gratuito) para editar sem mexer em código: produtos e preços,
fotos, contatos, endereço, horários e os textos das seções. O painel lê e grava os arquivos de `src/content/*.json`,
os mesmos que o site usa.

- **Modo atual (demonstração):** `backend: test-repo` em `public/admin/config.yml`. Dá para mexer em tudo, mas nada
  é salvo no site; ao recarregar, volta ao conteúdo atual.
- **Modo real:** cada "Publicar" vira um commit no GitHub e a Vercel atualiza o site. Para isso:
  1. criar um aplicativo OAuth no GitHub (Settings > Developer settings > OAuth Apps);
  2. publicar um pequeno servidor de autenticação (por exemplo, uma função na Vercel) com o Client ID e o Secret;
  3. trocar o bloco `backend` do `config.yml` pelo bloco comentado, com o endereço desse servidor;
  4. quem for editar precisa de conta no GitHub com acesso de escrita ao repositório.
- A rota `/admin` tem uma política de segurança (CSP) mais frouxa que a do site, porque o Decap exige `unsafe-eval`.
  Ela não é indexada (noindex) e não fica ligada a nenhuma página do site.
- Cores, SEO, categorias, diferenciais e galeria continuam em `src/config/site.ts` (ajuste técnico).
