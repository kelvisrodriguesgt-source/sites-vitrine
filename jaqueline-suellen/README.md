# Jaqueline Suellen Estética (protótipo de site institucional)

React + TypeScript + Tailwind CSS + Lucide, com HTML pré-renderizado no build (bom para SEO e carregamento rápido).
Site de apresentação do Grupo KR. Enquanto for protótipo, não aparece no Google (`noindex`).

## Onde editar tudo: `src/config/site.ts`

Um único arquivo concentra: nome e logotipo (texto), cores, fotos (nome do arquivo e texto alternativo),
tratamentos (nome, descrição, "saiba mais" e preço opcional), textos de todas as seções, avaliações, WhatsApp,
Instagram, endereço, horários, mapa e SEO.

- **WhatsApp:** uma única variável, `contact.whatsapp` (somente dígitos, `55` + DDD + número). Vale para o menu, o
  hero, os cartões, o formulário, o botão flutuante, o contato e o rodapé.
- **Horários:** hoje vazio (não foram informados). Preencha `hours: [{ label: 'Seg a Sex', time: '9h às 18h' }]`.
- **Endereço:** está como veio no briefing (`Rua Deofo Antônio geremias`), com `confirmed: false`. Confirme a
  grafia, troque `confirmed` para `true` e cole o embed do Google Maps em `address.mapEmbedSrc` (o CSP já libera
  `google.com`). Sem o embed, a seção mostra um espaço reservado.
- **Avaliações:** só avaliações reais, com a fonte. Para somar uma, adicione um item em `reviews`; a grade se ajusta.
  Atualize `googleRating`. Não há `aggregateRating` no JSON-LD (o Google não aceita autoavaliação).
- **Preço:** `price: 'R$ 120'` em um tratamento passa a exibir o valor no cartão. Vazio, não aparece.

## Fotos

Os espaços de foto aparecem como quadros nude com o monograma enquanto não houver arquivo. Nenhuma foto aleatória é
usada. Os prompts de cada imagem estão em [`docs/PROMPTS-IMAGENS.md`](docs/PROMPTS-IMAGENS.md).

```
1. Salve as fotos em imagens-originais/ com o nome do espaço (hero-estetica.png, limpeza-de-pele.jpg ...)
2. npm run images      # recorta na proporção certa, converte para .webp (até ~200 KB) em src/assets/images/
3. npm run build
```

Nomes: `hero-estetica`, `limpeza-de-pele`, `depilacao-laser`, `massoterapia`, `drenagem`, `dermaplaning`,
`auriculoterapia`, `ambiente-clinica`, `jaqueline-perfil`, `galeria-pele`, `galeria-procedimento`,
`galeria-bem-estar`. A foto da Jaqueline (`jaqueline-perfil`) deve ser **dela de verdade**. Fotos de IA são
ilustrativas e o site as identifica assim. Depois de trocar as fotos, rode `npm run assets` para refazer
favicon, ícone e a imagem de compartilhamento (`og-image.jpg`).

## Agendamento

O formulário (nome, telefone, tratamento, melhor dia e mensagem opcional) valida os campos, monta uma mensagem
organizada e abre o WhatsApp do número configurado. É só um pedido de contato: o site **nunca** diz que o horário
está confirmado. Quem confirma é a profissional.

## Instagram

A seção usa miniaturas ilustrativas e links para o perfil. Não há integração real com o Instagram.

## Versão final (depois da venda)

- `seo.indexable: true` e `seo.url` com o domínio real em `site.ts`; remover `X-Robots-Tag` do `vercel.json`.
- Descomentar a verificação do Search Console (comentário no `<head>` gerado em `src/lib/seo.ts`).
- `brand.demo: false` remove o aviso de protótipo do rodapé e o "endereço a confirmar" do contato.
- Trocar as imagens ilustrativas por fotos reais (espaço, procedimentos autorizados pelas clientes).

## Comandos

```
npm install
npm run dev        # desenvolvimento
npm test           # testes (agendamento, WhatsApp, configuração do briefing, SEO)
npm run build      # typecheck + build + pré-renderização em dist/
npm run qa         # QA no navegador (precisa do build; CHROMIUM_PATH opcional): capturas em qa-screenshots/
npm run assets     # favicon, apple-touch-icon e og-image (1200x630)
npm run images     # processa as fotos de imagens-originais/
```

## Segurança e SEO

`vercel.json` define `X-Robots-Tag: noindex, nofollow` (protótipo), CSP estrita (sem scripts nem estilos inline),
HSTS, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. Por isso o HTML nunca usa o atributo `style`:
use classes do Tailwind. Há um único H1 ("Sua beleza merece um cuidado especial", com "Esteticista em Vilhena - RO"
para leitores de tela e buscadores), H2 por seção, H3 nos tratamentos, imagens com `alt`, `width` e `height`,
JSON-LD `BeautySalon`, Open Graph, `robots.txt`, `sitemap.xml` e `llms.txt` gerados da configuração.

Tipografia: Cormorant Garamond (títulos principais), Playfair Display (títulos secundários), Montserrat (textos
e navegação) e Inter (botões e elementos funcionais), todas hospedadas no próprio site.
