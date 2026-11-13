import { useState } from 'react';
import { defaultContent } from '../../config/site';
import type { Images } from '../../config/types';
import type { ContentAdmin } from '../hooks';
import { PhotoPicker } from '../parts';
import { PageHeader, Tip, TextField, useSaved, useToast } from '../ui';

type Key = 'hero' | 'heroMobile' | 'reception' | 'clinicRoom' | 'technology' | 'ctaFinal';

interface Slot {
  key: Key;
  title: string;
  where: string;
  frame: string;
  ratio: number;
  ratioLabel: string;
  maxSide: number;
  alt?: keyof Images;
  tip?: string;
}

const SLOTS: Slot[] = [
  { key: 'hero', title: 'Topo do site (computador)', where: 'Foto grande da primeira tela', frame: 'aspect-video', ratio: 16 / 9, ratioLabel: 'horizontal 16:9', maxSide: 1600, alt: 'heroAlt', tip: 'O título fica por cima. Fotos mais escuras ou com espaço livre à esquerda funcionam melhor.' },
  { key: 'heroMobile', title: 'Topo do site (celular)', where: 'Mesma foto, em pé, para telas pequenas', frame: 'aspect-[3/4]', ratio: 3 / 4, ratioLabel: 'vertical 3:4', maxSide: 1000, tip: 'Deixe o rosto ou o ponto principal no centro da foto.' },
  { key: 'reception', title: 'Recepção', where: 'Fundo da seção “A clínica” e janela do vídeo', frame: 'aspect-video', ratio: 16 / 9, ratioLabel: 'horizontal 16:9', maxSide: 1400, alt: 'receptionAlt' },
  { key: 'clinicRoom', title: 'Consultório', where: 'Foto redonda da seção “A clínica”', frame: 'aspect-square', ratio: 1, ratioLabel: 'quadrada 1:1', maxSide: 900, alt: 'clinicRoomAlt' },
  { key: 'technology', title: 'Tecnologia', where: 'Foto da seção de equipamentos', frame: 'aspect-[4/3]', ratio: 4 / 3, ratioLabel: 'horizontal 4:3', maxSide: 900, alt: 'technologyAlt' },
  { key: 'ctaFinal', title: 'Fundo da chamada final', where: 'Última faixa do site (fica escurecida)', frame: 'aspect-video', ratio: 16 / 9, ratioLabel: 'horizontal 16:9', maxSide: 1400 }
];

export function Photos({ admin }: { admin: ContentAdmin }) {
  const info = admin.content.info;
  const saved = useSaved();
  const toast = useToast();

  const update = (patch: Partial<Images>, what: string) => saved(admin.save('info', { ...info, images: { ...info.images, ...patch } }), what);

  return (
    <>
      <PageHeader title="Fotos do site" intro="Troque as fotos sem se preocupar com tamanho: o painel reduz a imagem sozinho. Cada troca já vai para o site." />
      <div className="mb-5">
        <Tip>Use fotos da própria clínica. Evite fotos de pessoas sem autorização por escrito e fotos de “antes e depois”.</Tip>
      </div>
      <div className="grid gap-5 pb-8 md:grid-cols-2">
        {SLOTS.map((slot) => (
          <PhotoCard
            key={slot.key}
            slot={slot}
            value={info.images[slot.key]}
            alt={slot.alt ? info.images[slot.alt] : ''}
            custom={info.images[slot.key] !== defaultContent.info.images[slot.key]}
            onUpload={(url, ratio) => {
              update({ [slot.key]: url } as Partial<Images>, 'Foto trocada.');
              if (Math.abs(ratio / slot.ratio - 1) > 0.3) toast.push(`Essa foto tem outra proporção (o ideal é ${slot.ratioLabel}). As bordas podem ser cortadas.`, { ms: 8000 });
            }}
            onReset={() => update({ [slot.key]: defaultContent.info.images[slot.key] } as Partial<Images>, 'Foto original restaurada.')}
            onAlt={(v) => slot.alt && update({ [slot.alt]: v } as Partial<Images>, 'Descrição salva.')}
          />
        ))}
      </div>
    </>
  );
}

function PhotoCard({ slot, value, alt, custom, onUpload, onReset, onAlt }: { slot: Slot; value: string; alt: string; custom: boolean; onUpload: (url: string, ratio: number) => void; onReset: () => void; onAlt: (v: string) => void }) {
  const [text, setText] = useState(alt);
  return (
    <section className="a-card p-5" aria-label={slot.title}>
      <h2 className="a-h2">{slot.title}</h2>
      <p className="mb-4 text-sm text-navy/60">{slot.where}. Ideal: {slot.ratioLabel}.</p>
      <PhotoPicker title={slot.title} alt={alt} value={value} frame={slot.frame} maxSide={slot.maxSide} onChange={onUpload} onReset={custom ? onReset : undefined} hint={slot.tip} />
      {slot.alt && (
        <div className="mt-4 flex items-end gap-2">
          <TextField className="flex-1" label="Descreva a foto em poucas palavras" value={text} onChange={setText} maxLength={120} hint="Para leitor de tela e Google." />
          <button type="button" disabled={text.trim() === alt || text.trim().length < 5} onClick={() => onAlt(text.trim())} className="a-btn a-btn-ghost mb-7">
            Salvar
          </button>
        </div>
      )}
    </section>
  );
}
