import { CircleHelp, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FaqItem } from '../../config/types';
import type { ContentAdmin } from '../hooks';
import { RowActions, moveItem } from '../parts';
import { ConfirmDialog, Dialog, DialogHeader, EmptyState, PageHeader, TextArea, TextField, Tip, useSaved, useToast } from '../ui';

export function Faq({ admin }: { admin: ContentAdmin }) {
  const list = admin.content.faq.faq;
  const saved = useSaved();
  const toast = useToast();
  const [editing, setEditing] = useState<{ index: number; item: FaqItem } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const commit = (next: FaqItem[], what?: string) => saved(admin.save('faq', { faq: next }), what);

  return (
    <>
      <PageHeader
        title="Perguntas frequentes"
        intro="As dúvidas mais comuns dos pacientes, com respostas curtas e honestas."
        action={
          <button type="button" className="a-btn a-btn-primary" onClick={() => setEditing({ index: -1, item: { q: '', a: '' } })}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Nova pergunta
          </button>
        }
      />
      {list.length === 0 ? (
        <div className="a-card">
          <EmptyState icon={<CircleHelp className="h-6 w-6" />} title="Nenhuma pergunta" text="A lista de perguntas fica vazia no site até você adicionar." />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((f, i) => (
            <li key={`${f.q}-${i}`} className="a-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-semibold leading-snug">{f.q}</p>
                <p className="mt-1 line-clamp-2 text-sm text-navy/65">{f.a}</p>
              </div>
              <RowActions index={i} count={list.length} name={f.q} onMove={(d) => commit(moveItem(list, i, d), 'Ordem alterada.')} onEdit={() => setEditing({ index: i, item: f })} onRemove={() => setRemoving(i)} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <Tip>Não prometa resultado nem informe preços aqui. Para valores e condições, mande o paciente para o WhatsApp.</Tip>
      </div>

      {editing && (
        <FaqEditor
          key={editing.index}
          initial={editing.item}
          isNew={editing.index < 0}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            const next = [...list];
            if (editing.index < 0) next.push(item);
            else next[editing.index] = item;
            commit(next, editing.index < 0 ? 'Pergunta adicionada.' : 'Pergunta salva.');
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Remover pergunta?"
        text="Ela deixa de aparecer no site. Você poderá desfazer logo depois."
        confirmLabel="Remover"
        onConfirm={() => {
          if (removing === null) return;
          const previous = list;
          admin.save('faq', { faq: list.filter((_, i) => i !== removing) });
          toast.push('Pergunta removida.', { actionLabel: 'Desfazer', onAction: () => admin.save('faq', { faq: previous }), ms: 9000 });
        }}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}

function FaqEditor({ initial, isNew, onSave, onClose }: { initial: FaqItem; isNew: boolean; onSave: (f: FaqItem) => void; onClose: () => void }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<{ q?: string; a?: string }>({});
  const submit = () => {
    const e: typeof errors = {};
    const q = f.q.trim();
    if (q.length < 5) e.q = 'Escreva a pergunta.';
    if (f.a.trim().length < 10) e.a = 'Escreva uma resposta com pelo menos uma frase.';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ q: q.endsWith('?') ? q : `${q}?`, a: f.a.trim() });
  };
  return (
    <Dialog open onClose={onClose} label={isNew ? 'Nova pergunta' : 'Editar pergunta'} variant="side" maxWidth="max-w-xl">
      <DialogHeader title={isNew ? 'Nova pergunta' : 'Editar pergunta'} onClose={onClose} />
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <TextField label="Pergunta" value={f.q} onChange={(v) => setF({ ...f, q: v })} error={errors.q} placeholder="Ex.: Como agendo uma avaliação?" maxLength={100} autoFocus hint="O ponto de interrogação é colocado automaticamente." />
        <TextArea label="Resposta" value={f.a} onChange={(v) => setF({ ...f, a: v })} error={errors.a} rows={5} maxLength={400} />
      </div>
      <div className="flex justify-end gap-2 border-t border-navy/10 bg-white p-4">
        <button type="button" onClick={onClose} className="a-btn a-btn-ghost">
          Cancelar
        </button>
        <button type="button" onClick={submit} className="a-btn a-btn-primary">
          {isNew ? 'Adicionar ao site' : 'Salvar'}
        </button>
      </div>
    </Dialog>
  );
}
