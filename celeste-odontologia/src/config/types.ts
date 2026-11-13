export type IconName =
  | 'sparkles'
  | 'implant'
  | 'braces'
  | 'shield'
  | 'cpu'
  | 'users'
  | 'heart'
  | 'scan'
  | 'xray'
  | 'smile'
  | 'calendar'
  | 'message'
  | 'clipboard'
  | 'clock'
  | 'award'
  | 'stethoscope';

export interface Brand {
  name: string;
  /** Linha pequena sob o nome no logo. */
  segment: string;
  tagline: string;
  /** Site de demonstração: mostra a faixa "dados fictícios" no rodapé. */
  demo: boolean;
  demoNote: string;
}

export interface Colors {
  navy: string;
  ocean: string;
  mist: string;
  frost: string;
  champagne: string;
  pearl: string;
}

export interface Seo {
  /** URL de produção, sem barra no final. */
  url: string;
  title: string;
  /** Até 155 caracteres. */
  description: string;
  /** false = noindex (protótipo). Versão final: true. */
  indexable: boolean;
  locale: string;
  ogImage: string;
  schemaType: 'Dentist' | 'MedicalClinic' | 'LocalBusiness';
}

export interface Contact {
  /** Só dígitos, com 55 + DDD. */
  whatsapp: string;
  whatsappDisplay: string;
  phone: string;
  phoneTel: string;
  instagramHandle: string;
  instagramUrl: string;
  greeting: string;
  /** Use {tratamento} onde o nome do tratamento deve entrar. */
  treatmentGreeting: string;
}

export interface Address {
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  /** Vazio = mostra um espaço reservado no lugar do mapa. */
  mapEmbedSrc: string;
  /** Vazio = o botão "Como chegar" usa a busca do Google Maps pelo endereço. */
  directionsUrl: string;
}

export interface HoursRow {
  label: string;
  time: string;
  /** Para os dados estruturados (SEO): dias em inglês separados por vírgula e horários HH:MM. Vazio = não entra. */
  days: string;
  opens: string;
  closes: string;
}

export interface Treatment {
  id: string;
  title: string;
  /** Exatamente 3 itens curtos. */
  items: string[];
  image: string;
  imageAlt: string;
}

export interface Differential {
  icon: IconName;
  title: string;
  text: string;
}

export interface Highlight {
  /** Valor curto exibido em destaque, ex.: "+10". */
  value: string;
  label: string;
}

export interface TechItem {
  id: string;
  icon: IconName;
  title: string;
  text: string;
}

export interface TeamMember {
  name: string;
  specialty: string;
  /** Só aparece se preenchido. Nunca inventar registro profissional. */
  cro: string;
  bio: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Texts {
  header: { cta: string };
  hero: {
    eyebrow: string;
    /** `*itálico*` entre asteriscos. */
    title: string;
    srTitle: string;
    subtitle: string;
    primary: string;
    secondary: string;
    bubble: string;
    videoLabel: string;
    videoPlaceholder: string;
  };
  treatments: { eyebrow: string; title: string; subtitle: string; allCta: string; cardCta: string };
  clinic: { eyebrow: string; title: string; quote: string; roomCaption: string };
  highlights: { ctaTitle: string; ctaText: string; ctaButton: string };
  technology: { eyebrow: string; title: string; subtitle: string };
  team: { eyebrow: string; title: string; subtitle: string };
  steps: { eyebrow: string; title: string };
  faq: { eyebrow: string; title: string };
  contact: { eyebrow: string; title: string; subtitle: string; mapPlaceholder: string };
  finalCta: { title: string; text: string; button: string };
  seoIntro: string;
}

export interface Images {
  hero: string;
  heroAlt: string;
  heroMobile: string;
  reception: string;
  receptionAlt: string;
  clinicRoom: string;
  clinicRoomAlt: string;
  technology: string;
  technologyAlt: string;
  ctaFinal: string;
}

export interface SiteConfig {
  brand: Brand;
  colors: Colors;
  seo: Seo;
  contact: Contact;
  address: Address;
  hours: HoursRow[];
  treatments: Treatment[];
  differentials: Differential[];
  highlights: Highlight[];
  technology: TechItem[];
  team: TeamMember[];
  steps: Step[];
  faq: FaqItem[];
  images: Images;
  texts: Texts;
}

/** Conteúdo editável: um objeto por arquivo de src/content (e por área do painel). */
export interface InfoFile {
  brand: Brand;
  contact: Contact;
  address: Address;
  hours: HoursRow[];
  images: Images;
}
export interface TreatmentsFile {
  treatments: Treatment[];
}
export interface DifferentialsFile {
  differentials: Differential[];
  highlights: Highlight[];
  technology: TechItem[];
  steps: Step[];
}
export interface TeamFile {
  team: TeamMember[];
}
export interface FaqFile {
  faq: FaqItem[];
}
export interface Content {
  info: InfoFile;
  texts: Texts;
  treatments: TreatmentsFile;
  differentials: DifferentialsFile;
  team: TeamFile;
  faq: FaqFile;
}
export type ContentFile = keyof Content;
