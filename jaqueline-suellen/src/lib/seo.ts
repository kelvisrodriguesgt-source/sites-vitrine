import type { SiteConfig } from '../config/types';
import { fullAddress } from './format';
import { digitsOnly, formatPhone } from './whatsapp';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const abs = (base: string, path: string): string => (path.startsWith('http') ? path : `${base}${path}`);

export function buildJsonLd(config: SiteConfig): string {
  const { seo, brand, address, contact, treatments } = config;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: brand.name,
    description: seo.description,
    url: `${seo.url}/`,
    image: abs(seo.url, seo.ogImage),
    telephone: `+${digitsOnly(contact.whatsapp)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: 'BR'
    },
    areaServed: { '@type': 'City', name: `${address.city} - ${address.state}` },
    makesOffer: treatments.map((t) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t.name, description: t.description } })),
    sameAs: [contact.instagramUrl]
    // Sem aggregateRating: o Google não aceita autoavaliação, e há uma única avaliação.
  };
  // "<" escapado para o JSON nunca fechar a tag <script>.
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

/** Conteúdo injetado no <head> do index.html a partir da configuração. */
export function buildHead(config: SiteConfig): string {
  const { seo, brand } = config;
  const url = `${seo.url}/`;
  const image = abs(seo.url, seo.ogImage);
  const lines = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="keywords" content="${esc(seo.keywords.join(', '))}" />`,
    `<meta name="robots" content="${seo.indexable ? 'index, follow' : 'noindex, nofollow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="theme-color" content="${config.colors.offwhite}" />`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${esc(seo.locale)}" />`,
    `<meta property="og:site_name" content="${esc(brand.name)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<!-- google-site-verification: descomentar só na versão final
    <meta name="google-site-verification" content="CODIGO_DO_SEARCH_CONSOLE" /> -->`,
    `<script type="application/ld+json">${buildJsonLd(config)}</script>`
  ];
  return lines.join('\n    ');
}

export const buildRobots = (config: SiteConfig): string => `User-agent: *\nAllow: /\n\nSitemap: ${config.seo.url}/sitemap.xml\n`;

export const buildSitemap = (config: SiteConfig, date = new Date().toISOString().slice(0, 10)): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${config.seo.url}/</loc>\n    <lastmod>${date}</lastmod>\n  </url>\n</urlset>\n`;

export function buildLlms(config: SiteConfig): string {
  const { brand, address, contact, hours, treatments, seo, texts } = config;
  const hoursBlock = hours.length ? hours.map((h) => `- ${h.label}: ${h.time}`).join('\n') : `- ${config.hoursNote}`;
  return `# ${brand.name}

> ${texts.seoIntro}

${brand.demo ? `Aviso: ${brand.demoNote}\n\n` : ''}## Contato
- Endereço: ${fullAddress(address)}
- WhatsApp: ${formatPhone(contact.whatsapp)}
- Instagram: ${contact.instagramHandle}
- Site: ${seo.url}/

## Horários
${hoursBlock}

## Tratamentos
${treatments.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

## Como agendar
Escolha o tratamento no formulário do site: uma mensagem organizada é aberta no WhatsApp. O horário só é confirmado pela profissional.
`;
}
