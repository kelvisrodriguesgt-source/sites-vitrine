export type TextKind = 'line' | 'text' | 'title';
export interface TextField {
  path: string[];
  label: string;
  help?: string;
  kind: TextKind;
}
export interface TextSection {
  id: string;
  title: string;
  where: string;
  fields: TextField[];
}

const eyebrow = (section: string): TextField => ({ path: [section, 'eyebrow'], label: 'Linha pequena acima do título', kind: 'line', help: 'Ex.: "02 ——— Tratamentos".' });
const TITLE_HELP = 'Para destacar um trecho em itálico, coloque-o entre *asteriscos*.';

/** Todos os textos editáveis do site, em ordem de aparição, com nomes em português simples. */
export const TEXT_SECTIONS: TextSection[] = [
  {
    id: 'topo',
    title: 'Topo do site',
    where: 'Primeira tela, com a foto grande',
    fields: [
      { path: ['header', 'cta'], label: 'Botão do menu (no alto da página)', kind: 'line' },
      eyebrow('hero'),
      { path: ['hero', 'title'], label: 'Título principal', kind: 'title', help: TITLE_HELP },
      { path: ['hero', 'srTitle'], label: 'Frase para o Google e leitores de tela', kind: 'line', help: 'Não aparece na tela. Diga o tipo de clínica e a cidade.' },
      { path: ['hero', 'subtitle'], label: 'Frase abaixo do título', kind: 'text' },
      { path: ['hero', 'primary'], label: 'Botão principal', kind: 'line' },
      { path: ['hero', 'secondary'], label: 'Botão com sublinhado', kind: 'line' },
      { path: ['hero', 'bubble'], label: 'Balão sobre a foto', kind: 'line' },
      { path: ['hero', 'videoLabel'], label: 'Texto do cartão de vídeo', kind: 'line' },
      { path: ['hero', 'videoPlaceholder'], label: 'Aviso dentro da janela do vídeo', kind: 'line', help: 'Aparece até existir um vídeo real.' }
    ]
  },
  {
    id: 'tratamentos',
    title: 'Tratamentos',
    where: 'Carrossel de cartões',
    fields: [
      eyebrow('treatments'),
      { path: ['treatments', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP },
      { path: ['treatments', 'subtitle'], label: 'Frase de apoio', kind: 'text' },
      { path: ['treatments', 'allCta'], label: 'Link "ver todos"', kind: 'line' },
      { path: ['treatments', 'cardCta'], label: 'Início do texto do botão de cada cartão', kind: 'line', help: 'Usado para leitores de tela. Ex.: "Saber mais sobre".' }
    ]
  },
  {
    id: 'clinica',
    title: 'A clínica',
    where: 'Seção escura com a foto do consultório',
    fields: [
      eyebrow('clinic'),
      { path: ['clinic', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP },
      { path: ['clinic', 'quote'], label: 'Frase em destaque (em dourado)', kind: 'title', help: TITLE_HELP },
      { path: ['clinic', 'roomCaption'], label: 'Legenda da foto redonda', kind: 'line' }
    ]
  },
  {
    id: 'destaques',
    title: 'Faixa de destaques',
    where: 'Faixa clara com os números e o cartão azul',
    fields: [
      { path: ['highlights', 'ctaTitle'], label: 'Título do cartão azul', kind: 'line' },
      { path: ['highlights', 'ctaText'], label: 'Texto do cartão azul', kind: 'text' },
      { path: ['highlights', 'ctaButton'], label: 'Botão do cartão azul', kind: 'line' }
    ]
  },
  {
    id: 'tecnologia',
    title: 'Tecnologia',
    where: 'Seção com a foto dos equipamentos',
    fields: [eyebrow('technology'), { path: ['technology', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP }, { path: ['technology', 'subtitle'], label: 'Frase de apoio', kind: 'text' }]
  },
  {
    id: 'equipe',
    title: 'Equipe',
    where: 'Cartões dos profissionais',
    fields: [eyebrow('team'), { path: ['team', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP }, { path: ['team', 'subtitle'], label: 'Frase de apoio', kind: 'text' }]
  },
  {
    id: 'como',
    title: 'Como funciona',
    where: 'Os 3 passos do atendimento',
    fields: [eyebrow('steps'), { path: ['steps', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP }]
  },
  {
    id: 'faq',
    title: 'Perguntas frequentes',
    where: 'Título da lista de perguntas',
    fields: [eyebrow('faq'), { path: ['faq', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP }]
  },
  {
    id: 'contato',
    title: 'Contato',
    where: 'Endereço, horários e mapa',
    fields: [
      eyebrow('contact'),
      { path: ['contact', 'title'], label: 'Título da seção', kind: 'title', help: TITLE_HELP },
      { path: ['contact', 'subtitle'], label: 'Frase de apoio', kind: 'text' },
      { path: ['contact', 'mapPlaceholder'], label: 'Texto no lugar do mapa (enquanto não há mapa)', kind: 'line' }
    ]
  },
  {
    id: 'final',
    title: 'Chamada final',
    where: 'Última faixa, com a foto ao fundo',
    fields: [
      { path: ['finalCta', 'title'], label: 'Título', kind: 'title', help: TITLE_HELP },
      { path: ['finalCta', 'text'], label: 'Texto', kind: 'text' },
      { path: ['finalCta', 'button'], label: 'Botão', kind: 'line' }
    ]
  },
  {
    id: 'google',
    title: 'Resumo para o Google',
    where: 'Não aparece na tela',
    fields: [{ path: ['seoIntro'], label: 'Resumo da clínica em uma frase', kind: 'text', help: 'Usado por buscadores e assistentes de IA. Seja direto e verdadeiro.' }]
  }
];

export function getPath(obj: unknown, path: string[]): string {
  let cur: unknown = obj;
  for (const key of path) cur = (cur as Record<string, unknown> | undefined)?.[key];
  return typeof cur === 'string' ? cur : '';
}

export function setPath<T>(obj: T, path: string[], value: string): T {
  const [head, ...rest] = path;
  if (head === undefined) return obj;
  const rec = obj as Record<string, unknown>;
  return { ...rec, [head]: rest.length ? setPath(rec[head], rest, value) : value } as T;
}
