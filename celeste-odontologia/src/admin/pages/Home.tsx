import { CircleCheck, Circle, CircleHelp, ExternalLink, Hash, Image, Phone, RotateCcw, Sparkles, Type, Users } from 'lucide-react';
import { useState } from 'react';
import { defaultContent } from '../../config/site';
import type { ContentAdmin } from '../hooks';
import { ConfirmDialog, PageHeader, useSaved } from '../ui';
import type { Route } from '../config';

const AREAS: { id: Route; title: string; text: string; icon: typeof Sparkles }[] = [
  { id: 'tratamentos', title: 'Tratamentos', text: 'Adicione, troque a ordem, mude fotos e itens.', icon: Sparkles },
  { id: 'fotos', title: 'Fotos do site', text: 'Troque as fotos do topo, da recepção e do consultório.', icon: Image },
  { id: 'contato', title: 'Contato e horários', text: 'WhatsApp, endereço, horários e mapa.', icon: Phone },
  { id: 'equipe', title: 'Equipe', text: 'Profissionais, especialidades e registro (CRO).', icon: Users },
  { id: 'perguntas', title: 'Perguntas frequentes', text: 'As dúvidas mais comuns dos pacientes.', icon: CircleHelp },
  { id: 'textos', title: 'Textos do site', text: 'Títulos, frases e botões de todas as seções.', icon: Type },
  { id: 'numeros', title: 'Números e diferenciais', text: 'Blocos de destaque, tecnologia e passos.', icon: Hash }
];

const FILE_OF: Partial<Record<Route, string>> = { tratamentos: 'treatments', contato: 'info', fotos: 'info', equipe: 'team', perguntas: 'faq', textos: 'texts', numeros: 'differentials' };

export function Home({ admin }: { admin: ContentAdmin }) {
  const c = admin.content;
  const d = defaultContent;
  const saved = useSaved();
  const [confirm, setConfirm] = useState(false);

  const checklist: { done: boolean; label: string; route: Route }[] = [
    { done: c.info.contact.whatsapp !== d.info.contact.whatsapp, label: 'Colocar o WhatsApp real da clínica', route: 'contato' },
    { done: c.info.address.street !== d.info.address.street, label: 'Informar o endereço real', route: 'contato' },
    { done: c.info.address.mapEmbedSrc !== '', label: 'Adicionar o mapa do Google', route: 'contato' },
    { done: Object.values(c.info.images).some((v) => v.startsWith('data:')), label: 'Trocar as fotos pelas da clínica', route: 'fotos' },
    { done: c.team.team.length > 0 && c.team.team.every((m) => m.name !== d.team.team[0]?.name) || c.team.team.some((m) => m.cro !== ''), label: 'Informar a equipe real (e o CRO, se houver)', route: 'equipe' },
    { done: JSON.stringify(c.differentials.highlights) !== JSON.stringify(d.differentials.highlights), label: 'Conferir os números em destaque (só dados reais)', route: 'numeros' }
  ];
  const doneCount = checklist.filter((x) => x.done).length;

  return (
    <>
      <PageHeader title="Olá! O que você quer mudar hoje?" intro="Escolha uma área abaixo. Tudo o que você salvar aparece no site na hora." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map(({ id, title, text, icon: Icon }) => {
          const edited = admin.custom.includes(FILE_OF[id] as never);
          return (
            <a key={id} href={`#/${id}`} className="a-card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-champagne">
                <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="font-serif text-2xl font-semibold leading-tight">{title}</span>
              <span className="text-sm leading-snug text-navy/65">{text}</span>
              {edited && <span className="mt-auto self-start rounded-full bg-champagne px-3 py-1 text-xs font-medium">Já editado</span>}
            </a>
          );
        })}
      </div>

      <section className="a-card mt-8 p-5 sm:p-6" aria-labelledby="pronto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="pronto" className="a-h2">Para o site ficar pronto</h2>
            <p className="text-sm text-navy/60">Este é um site de demonstração com dados de exemplo. Estes passos o deixam com a cara do cliente.</p>
          </div>
          <p className="font-serif text-3xl font-semibold text-ocean" aria-label={`${doneCount} de ${checklist.length} passos concluídos`}>
            {doneCount}/{checklist.length}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist" role="presentation">
          <div className={`h-full rounded-full bg-navy transition-all ${PROGRESS[doneCount] ?? 'w-0'}`} />
        </div>
        <ul className="mt-5 divide-y divide-navy/10">
          {checklist.map((item) => (
            <li key={item.label}>
              <a href={`#/${item.route}`} className="flex min-h-12 items-center gap-3 py-2 hover:text-ocean">
                {item.done ? <CircleCheck className="h-6 w-6 shrink-0 text-emerald-600" aria-label="Concluído" /> : <Circle className="h-6 w-6 shrink-0 text-navy/30" aria-label="Pendente" />}
                <span className={item.done ? 'text-navy/55 line-through' : 'font-medium'}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/" target="_blank" rel="noopener" className="a-btn a-btn-primary">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver o site
        </a>
        {admin.custom.length > 0 && (
          <button type="button" className="a-btn a-btn-ghost" onClick={() => setConfirm(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Voltar tudo ao padrão
          </button>
        )}
      </div>
      <p className="mt-6 max-w-2xl rounded-2xl bg-mist/60 p-4 text-sm leading-relaxed text-navy/75">
        <strong>Modo demonstração:</strong> as alterações ficam salvas só neste navegador, para mostrar como o painel funciona. Na versão final, elas ficam salvas no servidor e valem para todos os visitantes.
      </p>

      <ConfirmDialog
        open={confirm}
        title="Voltar tudo ao padrão?"
        text="Todas as alterações feitas neste painel (textos, fotos, tratamentos, equipe, contato…) serão apagadas e o site volta ao que era no começo."
        confirmLabel="Voltar ao padrão"
        onConfirm={() => {
          admin.resetAll();
          saved(true, 'Tudo voltou ao padrão.');
        }}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}

/** Larguras fixas (o Tailwind só gera classes escritas por inteiro). */
const PROGRESS = ['w-0', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6', 'w-full'];
