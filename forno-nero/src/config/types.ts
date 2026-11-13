export type IconName = 'pizza' | 'cake' | 'cookie' | 'sandwich' | 'utensils' | 'cup' | 'ice-cream' | 'package';

export interface Category {
  id: string;
  label: string;
  icon: IconName;
}

export type SizeId = 'P' | 'M' | 'G';

export interface SizeOption {
  id: SizeId;
  /** Nome por extenso (ex.: "Média"). */
  label: string;
  /** Fatias da pizza neste tamanho. */
  slices: number;
  /** Preço em reais neste tamanho. */
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Preço em reais. Com `sizes`, é o menor preço (usado em "a partir de"); o painel mantém os dois sincronizados. */
  price: number;
  /** Tamanhos oferecidos. Sem tamanhos, o produto tem preço único. */
  sizes?: SizeOption[];
  category: string;
  /** Caminho da foto em /public. Sem foto, o card usa o bloco de marca provisório. */
  image?: string;
  imageAlt?: string;
  badge?: string;
  /** false = aparece como indisponível e não pode ser adicionado ao pedido. */
  available?: boolean;
}

export interface HoursRow {
  label: string;
  time: string;
  /** Para dados estruturados. Omitir quando fechado. */
  days?: string[];
  opens?: string;
  closes?: string;
}

export type HalfPricing = 'highest' | 'average';

export interface HalfAndHalfConfig {
  enabled: boolean;
  /** Categorias cujas pizzas podem ser combinadas. */
  categories: string[];
  /** highest = vale o preço do sabor mais caro; average = média dos dois. */
  pricing: HalfPricing;
}

export interface PromoBanner {
  id: string;
  title: string;
  text: string;
  /** Combo (produto da categoria Combos) adicionado ao pedido pelo botão. */
  productId: string;
  cta: string;
}

export interface Review {
  author: string;
  text: string;
  /** Fonte real obrigatória (ex.: "Google"). Nunca inventar avaliações. */
  source: string;
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
  colors: { ink: string; coal: string; card: string; line: string; red: string; ember: string; snow: string; ash: string };
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
  halfAndHalf: HalfAndHalfConfig;
  game: { enabled: boolean; durationSeconds: number };
  images: { hero: string; heroAlt: string; pepperoni: string[] };
  reviews: Review[];
  googleReviewsUrl: string;
  texts: {
    hero: { title: string; srTitle: string; primary: string };
    promoHeroText: string;
    game: { seal: string; text: string; title: string; start: string; again: string; instruction: string; recordLabel: string; close: string };
    menu: { title: string; subtitle: string; searchPlaceholder: string; searchButton: string; expand: string; empty: string; halfCta: string; halfText: string };
    promos: { title: string; subtitle: string; items: PromoBanner[] };
    reviews: { title: string; subtitle: string; empty: string; cta: string };
    delivery: { title: string; subtitle: string; steps: { title: string; text: string }[] };
    seoIntro: string;
  };
}
