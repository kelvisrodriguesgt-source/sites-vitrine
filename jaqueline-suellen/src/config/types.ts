export type AspectKey = '1/1' | '4/3' | '3/4' | '4/5' | '16/9';

/** Foto do site: o arquivo é procurado em src/assets/images/<file>.webp (ou .jpg/.png). Sem arquivo, aparece um espaço reservado. */
export interface ImageSlot {
  /** Nome do arquivo, sem extensão. */
  file: string;
  /** Proporção do quadro (usada para reservar o espaço e evitar saltos de layout). */
  ratio: AspectKey;
  /** Tamanho de referência em pixels (width/height do <img>). */
  width: number;
  height: number;
  /** Descrição para leitores de tela e para o Google. */
  alt: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  /** Texto do "Saiba mais". Neutro, sem promessa de resultado; confirmar com a profissional. */
  more: string;
  image: ImageSlot;
  /** Preço opcional, para o futuro. Vazio = não exibe. */
  price?: string;
}

export interface Review {
  author: string;
  text: string;
  rating: number;
  source: string;
}

export interface GalleryItem {
  image: ImageSlot;
  ratio: AspectKey;
}

export interface SiteColors {
  nude: string;
  offwhite: string;
  champagne: string;
  taupe: string;
  cocoa: string;
  white: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  nav: NavItem[];
  instagramTiles: ImageSlot[];
  brand: {
    name: string;
    professional: string;
    tagline: string;
    complement: string;
    initials: string;
    positioning: string;
    /** true enquanto for protótipo: mostra o aviso de apresentação no rodapé. */
    demo: boolean;
    demoNote: string;
  };
  contact: {
    /** Única variável do número: somente dígitos, com 55 + DDD. Todo o site usa esta. */
    whatsapp: string;
    instagramHandle: string;
    instagramUrl: string;
  };
  address: {
    street: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    /** Endereço exatamente como informado, a confirmar antes de publicar. */
    confirmed: boolean;
    /** Código do mapa (https://www.google.com/maps/embed...). Vazio = espaço reservado. */
    mapEmbedSrc: string;
  };
  hours: { label: string; time: string }[];
  hoursNote: string;
  colors: SiteColors;
  seo: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
    locale: string;
    indexable: boolean;
    keywords: string[];
  };
  images: {
    hero: ImageSlot;
    clinic: ImageSlot;
    profile: ImageSlot;
  };
  treatments: Treatment[];
  gallery: GalleryItem[];
  about: { title: string; paragraphs: string[]; highlights: string[]; cta: string };
  reviews: Review[];
  googleRating: { score: number; count: number };
  booking: { days: string[]; maxMessage: number };
  texts: Record<string, string>;
}
