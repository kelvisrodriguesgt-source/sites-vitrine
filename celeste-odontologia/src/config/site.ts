/**
 * Configuração central do site. Para adaptar a outra clínica, edite:
 *  - src/content/*.json (textos, tratamentos, equipe, FAQ, contatos), ou use o painel em /admin
 *  - as linhas de cores e de SEO abaixo
 *  - as fotos em public/img (mesmos nomes de arquivo)
 */
import differentialsData from '../content/differentials.json';
import faqData from '../content/faq.json';
import info from '../content/info.json';
import teamData from '../content/team.json';
import texts from '../content/texts.json';
import treatmentsData from '../content/treatments.json';
import type { Content, SiteConfig } from './types';

/** Conteúdo padrão (os arquivos JSON). O painel guarda alterações por cima disso, só no navegador (demonstração). */
export const defaultContent = {
  info,
  texts,
  treatments: treatmentsData,
  differentials: differentialsData,
  team: teamData,
  faq: faqData
} as unknown as Content;

export const COLORS: SiteConfig['colors'] = {
  navy: '#0E2338',
  ocean: '#1F3D5C',
  mist: '#DCE6EE',
  frost: '#F4F7FA',
  champagne: '#EFE2CF',
  pearl: '#FFFFFF'
};

export const SEO: SiteConfig['seo'] = {
  // Endereço de produção. Trocar pelo domínio final do cliente.
  url: 'https://celeste-odontologia.vercel.app',
  title: 'Celeste Odontologia | Clínica odontológica em Cidade Exemplo - MT',
  description:
    'Clínica odontológica em Cidade Exemplo - MT: estética dental, implantes, ortodontia e prevenção, com tecnologia e atendimento personalizado.',
  // Protótipo fora do Google. Versão final: true (e remover X-Robots-Tag do vercel.json).
  indexable: false,
  locale: 'pt_BR',
  ogImage: '/og-image.jpg',
  schemaType: 'Dentist'
};

export function buildSite(content: Content): SiteConfig {
  return {
    brand: content.info.brand,
    colors: COLORS,
    seo: SEO,
    contact: content.info.contact,
    address: content.info.address,
    hours: content.info.hours,
    treatments: content.treatments.treatments,
    differentials: content.differentials.differentials,
    // Números de exemplo. Substituir por dado real do cliente; se não houver dado real,
    // trocar por um diferencial sem número. Nunca inventar quantidade de pacientes ou percentuais.
    highlights: content.differentials.highlights,
    technology: content.differentials.technology,
    team: content.team.team,
    steps: content.differentials.steps,
    faq: content.faq.faq,
    images: content.info.images,
    texts: content.texts
  };
}

/** Versão padrão, usada na geração do HTML (SEO) e nos testes. */
export const site: SiteConfig = buildSite(defaultContent);
