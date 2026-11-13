import type { SiteConfig } from './types';

/**
 * ARQUIVO CENTRAL DE PERSONALIZAÇÃO.
 * Para transformar este protótipo em outra hamburgueria, altere apenas este arquivo
 * (e troque as fotos em /public/img). Todos os dados abaixo são FICTÍCIOS e demonstrativos.
 */
export const site: SiteConfig = {
  brand: {
    name: 'BRASA BURGER',
    tagline: 'Feito na hora. Feito para você.',
    segment: 'Hamburgueria artesanal',
    demo: true,
    demoNote: 'Site demonstrativo. Nome, endereço, telefone, horários e preços são fictícios.'
  },

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

  contact: {
    // Número fictício. Troque aqui (DDI + DDD + número, só dígitos) e todos os links do site mudam.
    whatsapp: '5500900000000',
    whatsappDisplay: '(00) 90000-0000',
    phone: '(00) 3000-0000',
    phoneTel: '+550030000000',
    instagramHandle: '@brasaburger.demo',
    instagramUrl: 'https://www.instagram.com/brasaburger.demo/',
    greeting: 'Olá! Vim pelo site da Brasa Burger e quero fazer um pedido.'
  },

  address: {
    street: 'Rua das Brasas, 123',
    district: 'Centro',
    city: 'Cidade Exemplo',
    state: 'MT',
    postalCode: '00000-000'
  },

  hours: [
    { label: 'Segunda', time: 'Fechado' },
    {
      label: 'Terça a domingo',
      time: '18h às 23h30',
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '18:00',
      closes: '23:30'
    }
  ],

  payments: ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro'],

  order: {
    deliveryNote: 'A taxa de entrega é informada pelo atendimento no WhatsApp.',
    sentNotice:
      'Abrimos o WhatsApp com o seu pedido. Ele só vale quando você envia a mensagem e o atendimento confirma.'
  },

  categories: [
    { id: 'hamburgueres', label: 'Hambúrgueres', icon: 'sandwich' },
    { id: 'combos', label: 'Combos', icon: 'package' },
    { id: 'porcoes', label: 'Porções', icon: 'utensils' },
    { id: 'bebidas', label: 'Bebidas', icon: 'cup' },
    { id: 'sobremesas', label: 'Sobremesas', icon: 'ice-cream' }
  ],

  products: [
    // Hambúrgueres
    {
      id: 'brasa-classic',
      name: 'Brasa Classic',
      description: 'Pão brioche, hambúrguer artesanal de 180g, queijo cheddar, alface, tomate e molho especial.',
      price: 32.9,
      category: 'hamburgueres',
      image: '/img/classic.webp',
      imageAlt: 'Hambúrguer Brasa Classic com queijo cheddar derretido, alface e tomate no pão brioche',
      featured: true,
      badge: 'Mais pedido'
    },
    {
      id: 'double-brasa',
      name: 'Double Brasa',
      description: 'Dois hambúrgueres de 120g, cheddar duplo, cebola caramelizada e molho da casa.',
      price: 39.9,
      category: 'hamburgueres',
      image: '/img/double.webp',
      imageAlt: 'Hambúrguer Double Brasa com dois hambúrgueres, cheddar duplo, alface e tomate',
      featured: true
    },
    {
      id: 'bacon-supreme',
      name: 'Bacon Supreme',
      description: 'Hambúrguer artesanal de 180g, cheddar, bacon crocante, cebola crispy e molho especial.',
      price: 42.9,
      category: 'hamburgueres',
      image: '/img/supreme.webp',
      imageAlt: 'Hambúrguer artesanal com cheddar derretido, alface e tomate no pão brioche',
      featured: true,
      badge: 'Novo'
    },
    {
      id: 'cheddar-melt',
      name: 'Cheddar Melt',
      description: 'Hambúrguer artesanal de 150g, cheddar cremoso em dobro e maionese da casa no pão brioche.',
      price: 36.9,
      category: 'hamburgueres',
      image: '/img/detalhe-queijo.webp',
      imageAlt: 'Detalhe de queijo cheddar derretido sobre hambúrguer grelhado'
    },
    {
      id: 'brasa-fresh',
      name: 'Brasa Fresh',
      description: 'Hambúrguer de 150g, queijo prato, alface americana, tomate e maionese da casa.',
      price: 31.9,
      category: 'hamburgueres',
      image: '/img/detalhe-pao.webp',
      imageAlt: 'Pão brioche com gergelim sobre alface fresca e molho'
    },

    // Combos
    {
      id: 'combo-individual',
      name: 'Combo Individual',
      description: '1 Brasa Classic + 1 batata frita pequena + 1 refrigerante lata.',
      price: 44.9,
      category: 'combos',
      image: '/img/classic.webp',
      imageAlt: 'Hambúrguer Brasa Classic, base do Combo Individual',
      badge: 'Para 1 pessoa'
    },
    {
      id: 'combo-casal',
      name: 'Combo Casal',
      description: '2 Brasa Classic + 1 batata frita grande + 2 refrigerantes lata.',
      price: 84.9,
      category: 'combos',
      image: '/img/double.webp',
      imageAlt: 'Hambúrguer de dois andares, ilustrando o Combo Casal',
      badge: 'Para 2 pessoas'
    },
    {
      id: 'combo-familia',
      name: 'Combo Família',
      description: '2 Brasa Classic + 2 Double Brasa + 2 batatas fritas grandes + 1 refrigerante 2L.',
      price: 159.9,
      category: 'combos',
      image: '/img/hero.webp',
      imageAlt: 'Hambúrguer Double Brasa sobre mesa de madeira, ilustrando o Combo Família',
      imagePosition: 'object-[85%_50%]',
      badge: 'Para 4 pessoas'
    },

    // Porções
    {
      id: 'batata-frita',
      name: 'Batata Frita',
      description: 'Porção de batatas fritas crocantes, sequinhas e temperadas.',
      price: 18.9,
      category: 'porcoes'
    },
    {
      id: 'onion-rings',
      name: 'Onion Rings',
      description: 'Anéis de cebola empanados e crocantes, acompanham molho da casa.',
      price: 21.9,
      category: 'porcoes'
    },
    {
      id: 'batata-cheddar-bacon',
      name: 'Batata Cheddar e Bacon',
      description: 'Batatas fritas cobertas com cheddar cremoso e bacon crocante.',
      price: 27.9,
      category: 'porcoes'
    },

    // Bebidas
    { id: 'refri-lata', name: 'Refrigerante lata', description: 'Lata 350ml, vários sabores.', price: 6.5, category: 'bebidas' },
    { id: 'suco', name: 'Suco natural', description: 'Copo de 400ml, sabores do dia.', price: 9.9, category: 'bebidas' },
    {
      id: 'milk-shake',
      name: 'Milk-shake',
      description: 'Copo de 400ml, sabores chocolate, morango ou baunilha.',
      price: 18.9,
      category: 'bebidas'
    },
    { id: 'agua', name: 'Água mineral', description: 'Garrafa 500ml, com ou sem gás.', price: 4.5, category: 'bebidas' },

    // Sobremesas
    {
      id: 'brownie',
      name: 'Brownie com sorvete',
      description: 'Brownie de chocolate quentinho com bola de sorvete de creme.',
      price: 16.9,
      category: 'sobremesas'
    },
    {
      id: 'sundae',
      name: 'Sundae',
      description: 'Sorvete de creme com calda de chocolate ou morango.',
      price: 14.9,
      category: 'sobremesas'
    }
  ],

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

  texts: {
    hero: {
      kicker: 'FEITO NA HORA. FEITO PARA VOCÊ.',
      title: 'SEU PRÓXIMO HAMBÚRGUER FAVORITO ESTÁ AQUI.',
      highlight: 'HAMBÚRGUER FAVORITO',
      subtitle: 'Carne suculenta, ingredientes selecionados e aquele sabor que faz você querer repetir.',
      primary: 'VER NOSSO CARDÁPIO',
      secondary: 'PEDIR PELO WHATSAPP'
    },
    highlights: {
      title: 'FRESCO, QUENTE E IRRESISTÍVEL.',
      subtitle: 'Cada detalhe importa. Do pão macio à carne preparada no ponto certo.'
    },
    menu: {
      title: 'CARDÁPIO COMPLETO',
      subtitle: 'Escolha por categoria, adicione ao pedido e envie pelo WhatsApp.'
    },
    experience: {
      title: 'NÃO É SÓ UM HAMBÚRGUER. É UMA EXPERIÊNCIA.',
      subtitle: 'O que faz a diferença na sua mesa.'
    },
    combos: {
      title: 'SEU MOMENTO MERECE UM COMBO.',
      subtitle: 'Hambúrguer, batata e bebida juntos, com um preço pensado para dividir ou aproveitar sozinho.'
    },
    story: {
      kicker: 'NOSSA HISTÓRIA',
      title: 'UMA PAIXÃO QUE VIROU SABOR.',
      text: 'Acreditamos que um bom hambúrguer começa com bons ingredientes, cuidado no preparo e vontade de entregar algo especial. Por isso, cada pedido é preparado com atenção para proporcionar uma experiência que vai muito além da fome.',
      cta: 'CONHEÇA NOSSO CARDÁPIO'
    },
    instagram: {
      title: 'ACOMPANHE NOSSA BRASA.',
      subtitle: 'Novidades, lançamentos e momentos deliciosos.',
      cta: 'VISITAR O INSTAGRAM'
    },
    contact: {
      title: 'VENHA NOS VISITAR',
      subtitle: 'Peça pelo site, pelo WhatsApp ou venha comer no salão.',
      cta: 'COMO CHEGAR'
    },
    finalCta: {
      title: 'DEU VONTADE? ENTÃO PEÇA!',
      subtitle: 'Seu próximo hambúrguer está a poucos cliques de distância.',
      cta: 'FAZER MEU PEDIDO'
    },
    seoIntro:
      'A Brasa Burger é uma hamburgueria artesanal em Cidade Exemplo, com hambúrgueres preparados na hora, combos, porções e sobremesas. Peça para entrega ou retirada pelo WhatsApp.'
  }
};
