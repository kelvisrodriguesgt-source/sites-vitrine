import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Treatment } from '../../config/types';
import { slugId } from '../../shared/content';
import type { ContentAdmin } from '../hooks';
import { PhotoPicker, RowActions, moveItem } from '../parts';
import { ConfirmDialog, Dialog, DialogHeader, EmptyState, PageHeader, TextField, Tip, useSaved, useToast } from '../ui';

const BLANK: Treatment = { id: '', title: '', items: ['', '', ''], image: '', imageAlt: '' };

export function Treatments({ admin }: { admin: ContentAdmin }) {
  const list = admin.content.treatments.treatments;
  const saved = useSaved();
  const toast = useToast();
  const [editing, setEditing] = useState<{ index: number; item: Treatment } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const commit = (next: Treatment[], what?: string) => saved(admin.save('treatments', { treatments: next }), what);

  const remove = (index: number) => {
    const previous = list;
    const name = list[index]?.title ?? 'Tratamento';
    admin.save('treatments', { treatments: list.filter((_, i) => i !== index) });
    toast.push(`"${name}" foi removido.`, { actionLabel: 'Desfazer', onAction: () => admin.save('treatments', { treatments: previous }), ms: 9000 });
  };

  return (
    <>
      <PageHeader
        title="Tratamentos"
        intro="Os cartões que aparecem no carrossel do site. Use as setas para mudar a ordem."
        action={
          <button type="button" className="a-btn a-btn-primary" onClick={() => setEditing({ index: -1, item: BLANK })}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Novo tratamento
          </button>
        }
      />
      {list.length === 0 ? (
        <div className="a-card">
          <EmptyState icon={<Sparkles className="h-6 w-6" />} title="Nenhum tratamento ainda" text="Adicione o primeiro tratamento para ele aparecer no site." />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((t, i) => (
            <li key={t.id} className="a-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ocean to-navy">
                {t.image && <img src={t.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl font-semibold leading-tight">{t.title}</p>
                <p className="mt-1 truncate text-sm text-navy/60">{t.items.filter(Boolean).join(' · ')}</p>
              </div>
              <RowActions
                index={i}
                count={list.length}
                name={t.title}
                onMove={(dir) => commit(moveItem(list, i, dir), 'Ordem alterada.')}
                onEdit={() => setEditing({ index: i, item: t })}
                onRemove={() => setRemoving(i)}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <Tip>No site, cada cartão tem um botão que leva ao WhatsApp já com o nome do tratamento na mensagem.</Tip>
      </div>

      {editing && (
        <TreatmentEditor
          key={editing.index}
          initial={editing.item}
          isNew={editing.index < 0}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            const next = [...list];
            if (editing.index < 0) next.push({ ...item, id: slugId(item.title, list.map((x) => x.id)) });
            else next[editing.index] = item;
            commit(next, editing.index < 0 ? 'Tratamento adicionado.' : 'Tratamento salvo.');
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Remover tratamento?"
        text={`"${removing !== null ? (list[removing]?.title ?? '') : ''}" deixa de aparecer no site. Você poderá desfazer logo depois.`}
        confirmLabel="Remover"
        onConfirm={() => removing !== null && remove(removing)}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}

function TreatmentEditor({ initial, isNew, onSave, onClose }: { initial: Treatment; isNew: boolean; onSave: (t: Treatment) => void; onClose: () => void }) {
  const [t, setT] = useState<Treatment>(initial);
  const [errors, setErrors] = useState<{ title?: string; items?: string }>({});

  const submit = () => {
    const e: typeof errors = {};
    if (t.title.trim().length < 2) e.title = 'Escreva o nome do tratamento.';
    if (t.items.some((x) => x.trim().length < 2)) e.items = 'Preencha os 3 itens (frases curtas).';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...t, title: t.title.trim(), items: t.items.map((x) => x.trim()), imageAlt: t.imageAlt.trim() || t.title.trim() });
  };

  return (
    <Dialog open onClose={onClose} label={isNew ? 'Novo tratamento' : 'Editar tratamento'} variant="side" maxWidth="max-w-xl">
      <DialogHeader title={isNew ? 'Novo tratamento' : 'Editar tratamento'} subtitle="Veja ao lado como o cartão fica no site." onClose={onClose} />
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Prévia do cartão */}
        <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-ocean to-navy" aria-label="Prévia do cartão">
          {t.image && <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/25 bg-navy/70 p-4 text-white backdrop-blur">
            <p className="font-serif text-2xl font-semibold leading-tight">{t.title || 'Nome do tratamento'}</p>
            <ul className="mt-2 space-y-0.5 text-xs text-white/85">
              {t.items.map((it, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: itens fixos (3), sem identificador próprio
                <li key={i}>— {it || 'Item'}</li>
              ))}
            </ul>
          </div>
        </div>

        <TextField label="Nome do tratamento" value={t.title} onChange={(v) => setT({ ...t, title: v })} error={errors.title} placeholder="Ex.: Clareamento" maxLength={40} autoFocus />
        <fieldset>
          <legend className="a-label">O que o tratamento inclui (3 itens)</legend>
          <div className="mt-1.5 space-y-2">
            {t.items.map((it, i) => (
              <input
                // biome-ignore lint/suspicious/noArrayIndexKey: campos fixos (3)
                key={i}
                aria-label={`Item ${i + 1}`}
                value={it}
                maxLength={48}
                placeholder={`Item ${i + 1}`}
                onChange={(e) => setT({ ...t, items: t.items.map((x, j) => (j === i ? e.target.value : x)) })}
                className="a-input"
              />
            ))}
          </div>
          {errors.items ? <p role="alert" className="a-err">{errors.items}</p> : <p className="a-hint">Frases curtas, sem promessa de resultado.</p>}
        </fieldset>
        <div>
          <p className="a-label mb-1.5">Foto do cartão</p>
          <PhotoPicker
            title="Foto do tratamento"
            alt={t.imageAlt}
            value={t.image}
            frame="aspect-[4/3]"
            maxSide={900}
            onChange={(url) => setT({ ...t, image: url })}
            onRemove={() => setT({ ...t, image: '' })}
            hint="Foto na horizontal (4:3) fica melhor. Sem foto, o cartão usa um fundo azul."
          />
        </div>
        <TextField
          label="Descreva a foto em poucas palavras"
          value={t.imageAlt}
          onChange={(v) => setT({ ...t, imageAlt: v })}
          maxLength={90}
          hint="Ajuda quem usa leitor de tela e o Google. Se deixar vazio, usamos o nome do tratamento."
        />
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
