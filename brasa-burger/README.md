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

## Painel da loja (/admin)

O endereço `/admin` abre o painel da loja, nas cores do site. Senha de demonstração: `brasa123` (definida em
`src/admin/config.ts`).

- **Dashboard:** faturamento, pedidos, ticket médio e pedidos em andamento (hoje, 7 e 30 dias, com comparação
  com o período anterior), gráfico por dia ou por hora, entrega x retirada, formas de pagamento e mais vendidos.
- **Pedidos:** lista por etapa (novo, em preparo, pronto/saiu para entrega, concluído, cancelado), busca,
  detalhes com histórico, avanço de status com um toque, cancelamento e cópia do resumo.
- **Produtos:** cardápio em cards, como num e-commerce: novo produto, editar, duplicar, excluir (com desfazer),
  preço, categoria, descrição, selo, foto (enviada do computador/celular e reduzida automaticamente),
  disponível/indisponível e até 3 destaques na página inicial. O site muda na hora.
- **Configurações:** dados de exemplo (ligar/desligar), exportar pedidos em CSV, restaurar o cardápio original.

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

O texto das seções, contatos, endereço e horários continuam em `src/content/*.json`; cores, SEO, categorias,
diferenciais e galeria, em `src/config/site.ts`.
