/**
 * Configuração central do site. Para adaptar a outra clínica, edite:
 *  - src/content/*.json (textos, tratamentos, equipe, FAQ, contatos), também editáveis em /admin
 *  - as linhas de cores e de SEO abaixo
 *  - as fotos em public/img (mesmos nomes de arquivo)
 */
import differentialsData from '../content/differentials.json';
import faqData from '../content/faq.json';
import info from '../content/info.json';
import teamData from '../content/team.json';
import texts from '../content/texts.json';
import treatmentsData from '../content/treatments.json';
import type { SiteConfig } from './types';

export const site: SiteConfig = {
  brand: info.brand,
  colors: {
    navy: '#0E2338',
    ocean: '#1F3D5C',
    mist: '#DCE6EE',
    frost: '#F4F7FA',
    champagne: '#EFE2CF',
    pearl: '#FFFFFF'
  },
  seo: {
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
  },
  contact: info.contact,
  address: info.address,
  hours: info.hours,
  treatments: treatmentsData.treatments,
  differentials: differentialsData.differentials as SiteConfig['differentials'],
  // Números de exemplo. Substituir por dado real do cliente; se não houver dado real,
  // trocar por um diferencial sem número. Nunca inventar quantidade de pacientes ou percentuais.
  highlights: differentialsData.highlights,
  technology: differentialsData.technology as SiteConfig['technology'],
  team: teamData.team,
  steps: differentialsData.steps,
  faq: faqData.faq,
  images: info.images,
  texts
};
