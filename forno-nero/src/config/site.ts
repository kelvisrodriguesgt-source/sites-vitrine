import infoData from '../content/info.json';
import productsData from '../content/products.json';
import textsData from '../content/texts.json';
import type { SiteConfig } from './types';

const info = infoData as Pick<SiteConfig, 'brand' | 'contact' | 'address' | 'hours' | 'payments' | 'order'>;

/**
 * ARQUIVO CENTRAL DE PERSONALIZAÇÃO.
 * Para transformar este protótipo em outra pizzaria, altere apenas este arquivo
 * (e troque as fotos em /public/img). Textos, produtos, preços, contatos e horários ficam em
 * src/content/*.json. O cardápio também pode ser editado no painel /admin (modo demonstração).
 * Todos os dados são FICTÍCIOS e demonstrativos.
 */
export const site: SiteConfig = {
  brand: info.brand,
  colors: {
    ink: '#0B0B0B',
    coal: '#161616',
    card: '#1E1E1E',
    line: '#2C2C2C',
    red: '#E53935',
    ember: '#E8751A',
    snow: '#FFFFFF',
    ash: '#A3A3A3'
  },

  seo: {
    url: 'https://forno-nero-self.vercel.app',
    title: 'Forno Nero Pizzaria | Pizzaria delivery em Cidade Exemplo - MT',
    description:
      'Pizzas, esfihas, calzones e porções com entrega em Cidade Exemplo. Veja o cardápio, monte o pedido e envie pelo WhatsApp. Site demonstrativo.',
    indexable: false,
    locale: 'pt_BR',
    ogImage: '/og-image.jpg',
    priceRange: '$$',
    cuisine: ['Pizza', 'Esfiha', 'Calzone']
  },

  contact: info.contact,
  address: info.address,
  hours: info.hours,
  payments: info.payments,
  order: info.order,

  categories: [
    { id: 'pizzas', label: 'Pizzas', icon: 'pizza' },
    { id: 'doces', label: 'Pizzas doces', icon: 'cake' },
    { id: 'esfihas', label: 'Esfihas', icon: 'cookie' },
    { id: 'calzones', label: 'Calzones', icon: 'sandwich' },
    { id: 'porcoes', label: 'Porções', icon: 'utensils' },
    { id: 'bebidas', label: 'Bebidas', icon: 'cup' },
    { id: 'sobremesas', label: 'Sobremesas', icon: 'ice-cream' },
    { id: 'combos', label: 'Combos', icon: 'package' }
  ],

  products: productsData.products as SiteConfig['products'],

  /** Pizza meio a meio: duas metades do mesmo tamanho; o preço segue `pricing`. */
  halfAndHalf: { enabled: true, categories: ['pizzas'], pricing: 'highest' },

  /** Minijogo "Pegue o pepperoni". `enabled: false` remove a seção e o botão do topo. */
  game: { enabled: true, durationSeconds: 30 },

  images: {
    hero: '/img/hero.webp',
    heroAlt: 'Pizza de pepperoni vista de cima, com a borda dourada',
    pepperoni: ['/img/pepperoni-1.webp', '/img/pepperoni-2.webp', '/img/pepperoni-3.webp', '/img/pepperoni-4.webp', '/img/pepperoni-5.webp', '/img/pepperoni-6.webp']
  },

  /** Só avaliações reais, com a fonte. Vazio = a seção mostra o convite para ver as avaliações do Google. */
  reviews: [],
  googleReviewsUrl: '',

  texts: textsData as SiteConfig['texts']
};
