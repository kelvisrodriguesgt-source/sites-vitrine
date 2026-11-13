import infoData from '../content/info.json';
import productsData from '../content/products.json';
import textsData from '../content/texts.json';
import type { SiteConfig } from './types';

const info = infoData as Pick<SiteConfig, 'brand' | 'contact' | 'address' | 'hours' | 'payments' | 'order'>;

/**
 * ARQUIVO CENTRAL DE PERSONALIZAÇÃO.
 * Para transformar este protótipo em outra hamburgueria, altere apenas este arquivo
 * (e troque as fotos em /public/img). Textos, produtos, preços, contatos e horários ficam em
 * src/content/*.json. O cardápio também pode ser editado no painel /admin (modo demonstração). Todos os dados são FICTÍCIOS e demonstrativos.
 */
export const site: SiteConfig = {
  brand: info.brand,
  colors: {
    wine: '#791D20',
    mustard: '#F5A900',
    tomato: '#E94B25',
    cream: '#F5EFD8',
    char: '#211715',
    white: '#FFFFFF'
  },

  seo: {
    url: 'https://brasa-burger-one.vercel.app',
    title: 'Brasa Burger | Hamburgueria artesanal em Cidade Exemplo - MT',
    description:
      'Hambúrguer artesanal feito na hora em Cidade Exemplo. Veja o cardápio, monte seu pedido e envie pelo WhatsApp. Site demonstrativo.',
    indexable: false,
    locale: 'pt_BR',
    ogImage: '/og-image.jpg',
    priceRange: '$$',
    cuisine: ['Hambúrguer', 'Lanches', 'Porções']
  },

  contact: info.contact,
  address: info.address,
  hours: info.hours,
  payments: info.payments,
  order: info.order,
  categories: [
    { id: 'hamburgueres', label: 'Hambúrgueres', icon: 'sandwich' },
    { id: 'combos', label: 'Combos', icon: 'package' },
    { id: 'porcoes', label: 'Porções', icon: 'utensils' },
    { id: 'bebidas', label: 'Bebidas', icon: 'cup' },
    { id: 'sobremesas', label: 'Sobremesas', icon: 'ice-cream' }
  ],

  products: productsData.products as SiteConfig['products'],
  differentials: [
    {
      icon: 'sprout',
      title: 'Ingredientes selecionados',
      text: 'Pão macio, queijo cheddar e vegetais frescos, escolhidos com critério.'
    },
    {
      icon: 'flame',
      title: 'Hambúrguer preparado na hora',
      text: 'A carne vai para a chapa depois que o seu pedido chega.'
    },
    {
      icon: 'droplet',
      title: 'Molhos exclusivos',
      text: 'Receitas da casa que dão assinatura a cada hambúrguer.'
    },
    {
      icon: 'heart',
      title: 'Qualidade em cada detalhe',
      text: 'Do ponto da carne à montagem, tudo pensado para chegar bonito e gostoso.'
    }
  ],

  gallery: [
    { src: '/img/classic.webp', alt: 'Hambúrguer com cheddar, alface e tomate no pão brioche' },
    { src: '/img/double.webp', alt: 'Hambúrguer de dois andares com cheddar duplo' },
    { src: '/img/detalhe-queijo.webp', alt: 'Queijo cheddar derretido sobre a carne' },
    { src: '/img/detalhe-pao.webp', alt: 'Pão brioche com gergelim e molho especial' },
    { src: '/img/mesa.webp', alt: 'Mesa de madeira e cadeiras pretas no salão' },
    { src: '/img/quadro-1.webp', alt: 'Quadro de hambúrguer na parede vermelha do salão' }
  ],

  images: {
    hero: '/img/hero.webp',
    heroMobile: '/img/double.webp',
    heroAlt: 'Hambúrguer artesanal de dois andares com cheddar derretido, alface e tomate sobre mesa de madeira',
    experience: '/img/ambiente.webp',
    story: '/img/cozinha.webp',
    storyAlt: 'Balcão de madeira iluminado e cozinha aberta da hamburgueria',
    finalCta: '/img/hero.webp'
  },

  texts: textsData as SiteConfig['texts'],
};
