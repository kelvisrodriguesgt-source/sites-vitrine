import { ChevronRight, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { parseRich } from '../../lib/rich';
import type { ContentAdmin } from '../hooks';
import { useDraft } from '../hooks';
import { TEXT_SECTIONS, getPath, setPath } from '../textFields';
import { ConfirmDialog, PageHeader, SaveBar, TextArea, TextField, Tip, useSaved } from '../ui';

function TitlePreview({ text }: { text: string }) {
  return (
    <p className="mt-2 rounded-xl bg-mist/60 px-4 py-3 font-serif text-2xl font-medium leading-tight" aria-label="Prévia do título">
      {parseRich(text).map((p, i) =>
        p.italic ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: partes de texto sem identificador próprio
          <em key={i} className="italic">
            {p.text}
          </em>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: partes de texto sem identificador próprio
          <span key={i}>{p.text}</span>
        )
      )}
    </p>
  );
}

export function Texts({ admin }: { admin: ContentAdmin }) {
  const { draft, setDraft, dirty, discard, markSaved } = useDraft(admin.content.texts);
  const saved = useSaved();
  const [open, setOpen] = useState<string | null>('topo');
  const [confirmReset, setConfirmReset] = useState(false);
  const customized = admin.custom.includes('texts');

  const save = () => {
    const ok = admin.save('texts', draft);
    if (ok) markSaved();
    saved(ok, 'Textos salvos.');
  };

  return (
    <>
      <PageHeader
        title="Textos do site"
        intro="Escolha uma seção, mude o texto e salve. A ordem abaixo é a mesma do site."
        action={
          customized ? (
            <button type="button" className="a-btn a-btn-ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Voltar aos textos originais
            </button>
          ) : undefined
        }
      />
      <div className="mb-5">
        <Tip>Evite promessas de resultado, “garantimos” e preços. Textos de saúde devem ser informativos.</Tip>
      </div>
      <div className="space-y-3 pb-24">
        {TEXT_SECTIONS.map((section) => {
          const isOpen = open === section.id;
          return (
            <section key={section.id} className="a-card overflow-hidden">
              <h2>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`sec-${section.id}`}
                  onClick={() => setOpen(isOpen ? null : section.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <ChevronRight className={`h-5 w-5 shrink-0 text-ocean transition-transform ${isOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block font-serif text-2xl font-semibold leading-tight">{section.title}</span>
                    <span className="block text-sm text-navy/60">{section.where}</span>
                  </span>
                </button>
              </h2>
              {isOpen && (
                <div id={`sec-${section.id}`} className="space-y-5 border-t border-navy/10 px-5 py-5">
                  {section.fields.map((f) => {
                    const value = getPath(draft, f.path);
                    const onChange = (v: string) => setDraft((d) => setPath(d, f.path, v));
                    return (
                      <div key={f.path.join('.')}>
                        {f.kind === 'text' ? (
                          <TextArea label={f.label} value={value} onChange={onChange} hint={f.help} rows={3} />
                        ) : (
                          <TextField label={f.label} value={value} onChange={onChange} hint={f.help} />
                        )}
                        {f.kind === 'title' && <TitlePreview text={value} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <SaveBar dirty={dirty} onSave={save} onDiscard={discard} />
      <ConfirmDialog
        open={confirmReset}
        title="Voltar aos textos originais?"
        text="Todos os textos editados nesta página voltam ao que o site tinha no começo."
        confirmLabel="Voltar ao original"
        onConfirm={() => {
          admin.reset('texts');
          saved(true, 'Textos originais restaurados.');
        }}
        onClose={() => setConfirmReset(false)}
      />
    </>
  );
}
