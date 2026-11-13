export type IconName = 'sandwich' | 'utensils' | 'cup' | 'ice-cream' | 'package';

export interface Category {
  id: string;
  label: string;
  icon: IconName;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Preço em reais (ex.: 32.9). Convertido para centavos internamente. */
  price: number;
  category: string;
  /** Caminho da foto em /public. Sem foto, o card usa o bloco de marca. */
  image?: string;
  imageAlt?: string;
  /** Classe Tailwind opcional para enquadrar a foto (ex.: object-[85%_50%]). */
  imagePosition?: string;
  /** Aparece na seção "Fresco, quente e irresistível". */
  featured?: boolean;
  badge?: string;
}

export interface HoursRow {
  label: string;
  time: string;
  /** Para dados estruturados. Omitir quando fechado. */
  days?: string[];
  opens?: string;
  closes?: string;
}

export interface Differential {
  icon: 'sprout' | 'flame' | 'droplet' | 'heart';
  title: string;
  text: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    segment: string;
    /** Marca o conteúdo como demonstrativo (faixa no rodapé e rótulos). */
    demo: boolean;
    demoNote: string;
  };
  /** Cores aplicadas ao Tailwind no build. */
  colors: { wine: string; mustard: string; tomato: string; cream: string; char: string; white: string };
  seo: {
    url: string;
    title: string;
    description: string;
    /** false enquanto for protótipo (noindex). */
    indexable: boolean;
    locale: string;
    ogImage: string;
    priceRange: string;
    cuisine: string[];
  };
  contact: {
    /** Número com DDI e DDD, só dígitos. Única variável do WhatsApp. */
    whatsapp: string;
    whatsappDisplay: string;
    phone: string;
    phoneTel: string;
    instagramHandle: string;
    instagramUrl: string;
    greeting: string;
  };
  address: {
    street: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    /** Substitui a busca padrão do Google Maps no botão "Como chegar". */
    directionsUrl?: string;
    /** URL de embed do Google Maps. Vazio mostra o espaço reservado. */
    mapEmbedSrc?: string;
  };
  hours: HoursRow[];
  payments: string[];
  order: { deliveryNote: string; sentNotice: string };
  categories: Category[];
  products: Product[];
  differentials: Differential[];
  gallery: { src: string; alt: string }[];
  images: {
    hero: string;
    heroMobile: string;
    heroAlt: string;
    experience: string;
    story: string;
    storyAlt: string;
    finalCta: string;
  };
  texts: {
    hero: { kicker: string; title: string; highlight?: string; subtitle: string; primary: string; secondary: string };
    highlights: { title: string; subtitle: string };
    menu: { title: string; subtitle: string };
    experience: { title: string; subtitle: string };
    combos: { title: string; subtitle: string };
    story: { kicker: string; title: string; text: string; cta: string };
    instagram: { title: string; subtitle: string; cta: string };
    contact: { title: string; subtitle: string; cta: string };
    finalCta: { title: string; subtitle: string; cta: string };
    seoIntro: string;
  };
}
