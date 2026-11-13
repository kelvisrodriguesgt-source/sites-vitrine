import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { DifferentialsFile } from '../../config/types';
import type { ContentAdmin } from '../hooks';
import { useDraft } from '../hooks';
import { ConfirmDialog, IconPicker, PageHeader, SaveBar, TextArea, TextField, Tip, useSaved } from '../ui';

export function Numbers({ admin }: { admin: ContentAdmin }) {
  const { draft, setDraft, dirty, discard, markSaved } = useDraft<DifferentialsFile>(admin.content.differentials);
  const saved = useSaved();
  const [errors, setErrors] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState(false);

  const patch = <K extends keyof DifferentialsFile>(key: K, index: number, change: Partial<DifferentialsFile[K][number]>) =>
    setDraft((d) => ({ ...d, [key]: d[key].map((item, i) => (i === index ? { ...item, ...change } : item)) }));

  const save = () => {
    const empty =
      draft.differentials.some((x) => x.title.trim().length < 2 || x.text.trim().length < 5) ||
      draft.highlights.some((x) => x.value.trim().length < 1 || x.label.trim().length < 2) ||
      draft.technology.some((x) => x.title.trim().length < 2 || x.text.trim().length < 5) ||
      draft.steps.some((x) => x.title.trim().length < 2 || x.text.trim().length < 5);
    if (empty) {
      setErrors('Há campos vazios. Preencha todos os títulos e textos antes de salvar.');
      return;
    }
    setErrors('');
    const ok = admin.save('differentials', draft);
    if (ok) markSaved();
    saved(ok, 'Salvo.');
  };

  return (
    <>
      <PageHeader
        title="Números e diferenciais"
        intro="Os blocos de destaque do site. Cada grupo tem 3 itens."
        action={
          admin.custom.includes('differentials') ? (
            <button type="button" className="a-btn a-btn-ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Voltar ao original
            </button>
          ) : undefined
        }
      />
      {errors && (
        <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-4 font-medium text-rose-800">
          {errors}
        </p>
      )}
      <div className="space-y-5 pb-24">
        <section className="a-card p-5 sm:p-6" aria-labelledby="n-dif">
          <h2 id="n-dif" className="a-h2">Diferenciais da clínica</h2>
          <p className="mb-5 text-sm text-navy/60">Aparecem na seção escura “A clínica”.</p>
          <div className="space-y-6">
            {draft.differentials.map((d, i) => (
              <div key={`dif-${d.icon}-${i}`} className="space-y-4 rounded-2xl bg-paper p-4">
                <IconPicker label={`Ícone do item ${i + 1}`} value={d.icon} onChange={(icon) => patch('differentials', i, { icon })} />
                <TextField label="Título" value={d.title} onChange={(v) => patch('differentials', i, { title: v })} maxLength={40} />
                <TextArea label="Texto" value={d.text} onChange={(v) => patch('differentials', i, { text: v })} maxLength={140} rows={2} />
              </div>
            ))}
          </div>
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="n-num">
          <h2 id="n-num" className="a-h2">Números em destaque</h2>
          <p className="mb-4 text-sm text-navy/60">A faixa clara com números grandes.</p>
          <div className="mb-5">
            <Tip tone="warn">Use só números reais e comprovados do cliente. Se não houver, troque por um diferencial sem número (ex.: valor “Hora marcada”). Nunca invente quantidade de pacientes nem porcentagens.</Tip>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {draft.highlights.map((h, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 3 itens fixos
              <div key={i} className="space-y-4 rounded-2xl bg-paper p-4">
                <TextField label="Destaque" value={h.value} onChange={(v) => patch('highlights', i, { value: v })} maxLength={16} placeholder="Ex.: +10" />
                <TextField label="O que significa" value={h.label} onChange={(v) => patch('highlights', i, { label: v })} maxLength={60} placeholder="Ex.: anos de experiência" />
              </div>
            ))}
          </div>
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="n-tec">
          <h2 id="n-tec" className="a-h2">Tecnologia</h2>
          <p className="mb-5 text-sm text-navy/60">Equipamentos e recursos, na seção “Tecnologia”.</p>
          <div className="space-y-6">
            {draft.technology.map((t, i) => (
              <div key={t.id} className="space-y-4 rounded-2xl bg-paper p-4">
                <IconPicker label={`Ícone do item ${i + 1}`} value={t.icon} onChange={(icon) => patch('technology', i, { icon })} />
                <TextField label="Nome" value={t.title} onChange={(v) => patch('technology', i, { title: v })} maxLength={50} />
                <TextArea label="Explicação" value={t.text} onChange={(v) => patch('technology', i, { text: v })} maxLength={160} rows={2} hint="Descreva o que é, sem prometer resultado." />
              </div>
            ))}
          </div>
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="n-steps">
          <h2 id="n-steps" className="a-h2">Como funciona</h2>
          <p className="mb-5 text-sm text-navy/60">Os 3 passos do atendimento, em ordem.</p>
          <div className="space-y-4">
            {draft.steps.map((s, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 3 passos fixos
              <div key={i} className="space-y-4 rounded-2xl bg-paper p-4">
                <p className="font-serif text-xl font-semibold text-ocean">Passo {i + 1}</p>
                <TextField label="Título" value={s.title} onChange={(v) => patch('steps', i, { title: v })} maxLength={40} />
                <TextArea label="Texto" value={s.text} onChange={(v) => patch('steps', i, { text: v })} maxLength={140} rows={2} />
              </div>
            ))}
          </div>
        </section>
      </div>
      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { discard(); setErrors(''); }} />
      <ConfirmDialog
        open={confirmReset}
        title="Voltar ao original?"
        text="Diferenciais, números, tecnologia e passos voltam ao que o site tinha no começo."
        confirmLabel="Voltar ao original"
        onConfirm={() => {
          admin.reset('differentials');
          saved(true, 'Original restaurado.');
        }}
        onClose={() => setConfirmReset(false)}
      />
    </>
  );
}
