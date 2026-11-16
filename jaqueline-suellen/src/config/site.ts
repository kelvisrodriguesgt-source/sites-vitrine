import type { ImageSlot, SiteConfig } from './types';

/**
 * CONFIGURAÇÃO CENTRAL DO SITE
 * Aqui ficam nome, logotipo (texto), cores, fotos, tratamentos, descrições, WhatsApp, Instagram, endereço e horários.
 * Os dados de contato vêm do briefing da profissional e precisam de confirmação antes da publicação.
 */

const photo = (file: string, ratio: ImageSlot['ratio'], width: number, height: number, alt: string): ImageSlot => ({ file, ratio, width, height, alt });

const treatmentImages = {
  limpeza: photo('limpeza-de-pele', '4/3', 1200, 900, 'Limpeza de pele facial em ambiente de estética, em tons nude (imagem ilustrativa)'),
  laser: photo('depilacao-laser', '4/3', 1200, 900, 'Depilação a laser em ambiente de estética, em tons nude (imagem ilustrativa)'),
  massagem: photo('massoterapia', '4/3', 1200, 900, 'Massoterapia relaxante em ambiente acolhedor (imagem ilustrativa)'),
  drenagem: photo('drenagem', '4/3', 1200, 900, 'Tratamento corporal com movimentos manuais, em tons nude (imagem ilustrativa)'),
  dermaplaning: photo('dermaplaning', '4/3', 1200, 900, 'Dermaplaning, procedimento facial delicado (imagem ilustrativa)')
};

export const site: SiteConfig = {
  nav: [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Tratamentos', href: '#tratamentos' },
    { label: 'A profissional', href: '#profissional' },
    { label: 'Resultados', href: '#resultados' },
    { label: 'Contato', href: '#contato' }
  ],
  // Miniaturas ilustrativas: não há integração real com o Instagram.
  instagramTiles: [
    treatmentImages.limpeza,
    treatmentImages.massagem,
    treatmentImages.laser,
    treatmentImages.dermaplaning,
    treatmentImages.drenagem,
    photo('galeria-pele', '4/5', 960, 1200, 'Pele facial com aparência natural e iluminação suave (imagem ilustrativa)')
  ],
  brand: {
    name: 'Jaqueline Suellen Estética',
    professional: 'Jaqueline Suellen',
    tagline: 'Beleza, cuidado e bem-estar em cada detalhe.',
    complement: 'Estética e bem-estar',
    initials: 'JS',
    positioning: 'Beleza, cuidado e bem-estar em cada detalhe.',
    demo: true,
    demoNote: 'Protótipo de apresentação do Grupo KR. Textos, fotos e informações sujeitos à aprovação da profissional. Imagens ilustrativas.'
  },
  contact: {
    whatsapp: '5569933004605',
    instagramHandle: '@jaquelinesuellen.estetica',
    instagramUrl: 'https://www.instagram.com/jaquelinesuellen.estetica/'
  },
  address: {
    // Grafia mantida exatamente como informada. Confirmar antes de publicar.
    street: 'Rua Deofo Antônio geremias',
    district: 'Jardim América',
    city: 'Vilhena',
    state: 'RO',
    postalCode: '76980-740',
    confirmed: false,
    mapEmbedSrc: ''
  },
  // Horários ainda não informados: o site não exibe nenhum horário inventado.
  hours: [],
  hoursNote: 'Horários de atendimento a confirmar. Consulte a disponibilidade pelo WhatsApp.',
  colors: {
    nude: '#E9DED3',
    offwhite: '#F8F5F0',
    champagne: '#B59B85',
    taupe: '#766052',
    cocoa: '#292421',
    white: '#FFFFFF'
  },
  seo: {
    title: 'Esteticista em Vilhena - RO | Jaqueline Suellen Estética',
    description: 'Esteticista em Vilhena - RO: limpeza de pele, depilação a laser, massoterapia e mais. Agende seu horário com Jaqueline Suellen pelo WhatsApp.',
    // Endereço de produção do protótipo (trocar pelo domínio próprio na versão final).
    url: 'https://jaqueline-suellen.vercel.app',
    ogImage: '/og-image.jpg',
    locale: 'pt_BR',
    indexable: false,
    keywords: ['esteticista em Vilhena RO', 'clínica de estética em Vilhena', 'limpeza de pele em Vilhena', 'depilação a laser em Vilhena', 'massoterapia em Vilhena', 'tratamentos estéticos em Vilhena']
  },
  images: {
    hero: photo('hero-estetica', '16/9', 1920, 1080, 'Mulher em retrato editorial de beleza, em tons nude e bege (imagem ilustrativa)'),
    clinic: photo('ambiente-clinica', '16/9', 1920, 1080, 'Ambiente de estética acolhedor, com recepção em tons nude e madeira clara (imagem ilustrativa)'),
    profile: photo('jaqueline-perfil', '4/5', 1000, 1250, 'Jaqueline Suellen, esteticista e massoterapeuta')
  },
  treatments: [
    {
      id: 'limpeza-de-pele',
      name: 'Limpeza de pele',
      description: 'Um momento dedicado ao cuidado da pele, com atenção às necessidades individuais.',
      more: 'O atendimento é adaptado a cada pele. Durante a avaliação, a profissional explica as etapas e o que é indicado para você.',
      image: treatmentImages.limpeza
    },
    {
      id: 'depilacao-a-laser',
      name: 'Depilação a laser',
      description: 'Conheça os cuidados e procedimentos de depilação a laser disponíveis.',
      more: 'Converse com a profissional para saber como funciona o atendimento, as áreas disponíveis e se ele é indicado para o seu caso.',
      image: treatmentImages.laser
    },
    {
      id: 'massoterapia',
      name: 'Massoterapia',
      description: 'Um momento de cuidado e relaxamento, dedicado ao seu bem-estar.',
      more: 'A massagem é conduzida com atenção às suas necessidades e ao seu conforto. Tire suas dúvidas pelo WhatsApp antes de agendar.',
      image: treatmentImages.massagem
    },
    {
      id: 'drenagem',
      name: 'Drenagem',
      description: 'Tratamento corporal voltado ao cuidado e bem-estar.',
      more: 'Os detalhes do atendimento são explicados pela profissional, conforme a sua avaliação e a sua indicação.',
      image: treatmentImages.drenagem
    },
    {
      id: 'dermaplaning',
      name: 'Dermaplaning',
      description: 'Procedimento estético facial com foco na renovação superficial da pele.',
      more: 'É um procedimento facial delicado. A profissional avalia a sua pele e orienta sobre os cuidados antes e depois do atendimento.',
      image: treatmentImages.dermaplaning
    },
    {
      id: 'auriculoterapia',
      name: 'Auriculoterapia',
      description: 'Uma abordagem complementar de cuidado, conforme avaliação e indicação profissional.',
      more: 'É uma abordagem complementar, aplicada conforme avaliação e indicação da profissional. Converse pelo WhatsApp para entender como funciona.',
      // Sem foto própria no briefing: usa um espaço reservado até existir uma imagem real.
      image: photo('auriculoterapia', '4/3', 1200, 900, 'Auriculoterapia, cuidado complementar (imagem ilustrativa)')
    }
  ],
  gallery: [
    { ratio: '4/5', image: photo('galeria-pele', '4/5', 960, 1200, 'Pele facial com aparência natural e iluminação suave (imagem ilustrativa)') },
    { ratio: '1/1', image: treatmentImages.limpeza },
    { ratio: '3/4', image: photo('galeria-procedimento', '3/4', 900, 1200, 'Mãos de uma profissional realizando um procedimento facial (imagem ilustrativa)') },
    { ratio: '4/3', image: photo('galeria-bem-estar', '4/3', 1200, 900, 'Ambiente de massoterapia com toalhas claras e iluminação quente (imagem ilustrativa)') },
    { ratio: '4/5', image: treatmentImages.dermaplaning },
    { ratio: '1/1', image: treatmentImages.laser }
  ],
  about: {
    title: 'Muito prazer, sou Jaqueline Suellen.',
    paragraphs: [
      'Sou profissional da área da estética e massoterapia, apaixonada pelo universo do cuidado pessoal e da beleza.',
      'Acredito que cada pessoa merece um atendimento individualizado, acolhedor e realizado com atenção aos detalhes.',
      'Meu propósito é proporcionar momentos de cuidado e bem-estar, respeitando as necessidades e particularidades de cada cliente.'
    ],
    highlights: ['Esteticista', 'Massoterapeuta', 'Depilação a laser'],
    cta: 'Agende seu atendimento'
  },
  // Somente avaliações reais, com a fonte. Novas avaliações entram aqui.
  reviews: [
    {
      author: 'Solange Machado',
      text: 'Excelente profissional, bom atendimento e com pontualidade, super indico.',
      rating: 5,
      source: 'Avaliação no Google'
    }
  ],
  googleRating: { score: 5, count: 1 },
  booking: {
    days: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Qualquer dia'],
    maxMessage: 500
  },
  texts: {
    heroEyebrow: 'Beleza, cuidado e bem-estar.',
    heroTitle: 'Sua beleza merece um cuidado especial.',
    heroSrTitle: 'Esteticista em Vilhena - RO',
    heroSubtitle: 'Tratamentos estéticos pensados para valorizar sua beleza, cuidar da sua pele e proporcionar momentos de autocuidado.',
    heroPrimary: 'Agendar meu horário',
    heroSecondary: 'Conhecer tratamentos',
    headerCta: 'Agendar horário',
    treatmentsTitle: 'Cuidados pensados para você.',
    treatmentsSubtitle: 'Conheça os tratamentos e descubra novas formas de cuidar de si.',
    treatmentsNote: 'A lista de tratamentos está sujeita à confirmação da profissional.',
    aboutEyebrow: 'A profissional',
    clinicEyebrow: 'Experiência e ambiente',
    clinicTitle: 'Um espaço para você se cuidar.',
    clinicText: 'Mais do que realizar um procedimento, queremos que cada atendimento seja um momento dedicado a você.',
    clinicCta: 'Conheça os tratamentos',
    clinicNote: 'Imagem demonstrativa. As fotografias reais do espaço entram assim que forem fornecidas.',
    galleryEyebrow: 'Resultados e procedimentos',
    galleryTitle: 'Beleza em cada detalhe.',
    galleryNote: 'Imagens ilustrativas. Fotografias de procedimentos e resultados reais, incluindo antes e depois, só serão publicadas com a autorização das clientes.',
    reviewsEyebrow: 'Depoimentos',
    reviewsTitle: 'Carinho e cuidado reconhecidos.',
    reviewsEmpty: 'Novas avaliações de clientes aparecerão aqui.',
    instagramEyebrow: 'Instagram',
    instagramTitle: 'Acompanhe nosso universo de cuidados.',
    instagramSubtitle: 'Conteúdos, procedimentos, novidades e momentos especiais.',
    instagramNote: 'Pré-visualização ilustrativa. As publicações reais estão no perfil do Instagram.',
    instagramCta: 'Seguir no Instagram',
    bookingEyebrow: 'Agendamento',
    bookingTitle: 'Seu momento de cuidado começa aqui.',
    bookingText: 'Escolha seu tratamento e entre em contato para agendar seu horário.',
    bookingNote: 'O horário só é confirmado pela profissional, depois do seu contato pelo WhatsApp.',
    contactEyebrow: 'Localização e contato',
    contactTitle: 'Vamos cuidar de você?',
    contactSubtitle: 'Esteticista em Vilhena - RO. Atendimento com hora marcada pelo WhatsApp.',
    contactInclusive: 'Um espaço acolhedor para todas as pessoas, incluindo a comunidade LGBTQ+.',
    mapPlaceholder: 'O mapa será exibido assim que o endereço for confirmado.',
    seoIntro: 'Jaqueline Suellen Estética é um espaço de estética e bem-estar em Vilhena - RO, com atendimento de esteticista e massoterapeuta: limpeza de pele, depilação a laser, massoterapia, drenagem, dermaplaning e auriculoterapia.'
  }
};
