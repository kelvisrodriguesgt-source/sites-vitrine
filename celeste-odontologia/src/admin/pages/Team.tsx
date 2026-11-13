import { Plus, Users } from 'lucide-react';
import { useState } from 'react';
import type { TeamMember } from '../../config/types';
import type { ContentAdmin } from '../hooks';
import { RowActions, moveItem } from '../parts';
import { ConfirmDialog, Dialog, DialogHeader, EmptyState, PageHeader, TextArea, TextField, Tip, useSaved, useToast } from '../ui';

const BLANK: TeamMember = { name: '', specialty: '', cro: '', bio: '' };
const initials = (name: string): string =>
  name
    .replace(/^(Dra?\.|Prof\.?)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

export function Team({ admin }: { admin: ContentAdmin }) {
  const list = admin.content.team.team;
  const saved = useSaved();
  const toast = useToast();
  const [editing, setEditing] = useState<{ index: number; item: TeamMember } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const commit = (next: TeamMember[], what?: string) => saved(admin.save('team', { team: next }), what);

  return (
    <>
      <PageHeader
        title="Equipe"
        intro="Os profissionais que aparecem na seção “Equipe”. Se não houver ninguém, a seção some do site."
        action={
          <button type="button" className="a-btn a-btn-primary" onClick={() => setEditing({ index: -1, item: BLANK })}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Novo profissional
          </button>
        }
      />
      {list.length === 0 ? (
        <div className="a-card">
          <EmptyState icon={<Users className="h-6 w-6" />} title="Nenhum profissional" text="A seção Equipe não aparece no site enquanto estiver vazia." />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((m, i) => (
            <li key={`${m.name}-${i}`} className="a-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mist font-serif text-2xl font-semibold text-ocean">
                {initials(m.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-2xl font-semibold leading-tight">{m.name}</p>
                <p className="mt-0.5 text-sm text-navy/65">
                  {m.specialty}
                  {m.cro ? ` · ${m.cro}` : ' · sem registro informado'}
                </p>
              </div>
              <RowActions index={i} count={list.length} name={m.name} onMove={(d) => commit(moveItem(list, i, d), 'Ordem alterada.')} onEdit={() => setEditing({ index: i, item: m })} onRemove={() => setRemoving(i)} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <Tip tone="warn">
          O número do registro (CRO) só aparece no site se você preencher. Nunca invente um registro: informe somente o que o profissional confirmou.
        </Tip>
      </div>

      {editing && (
        <MemberEditor
          key={editing.index}
          initial={editing.item}
          isNew={editing.index < 0}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            const next = [...list];
            if (editing.index < 0) next.push(item);
            else next[editing.index] = item;
            commit(next, editing.index < 0 ? 'Profissional adicionado.' : 'Profissional salvo.');
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        title="Remover profissional?"
        text={`"${removing !== null ? (list[removing]?.name ?? '') : ''}" deixa de aparecer no site. Você poderá desfazer logo depois.`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (removing === null) return;
          const previous = list;
          admin.save('team', { team: list.filter((_, i) => i !== removing) });
          toast.push('Profissional removido.', { actionLabel: 'Desfazer', onAction: () => admin.save('team', { team: previous }), ms: 9000 });
        }}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}

function MemberEditor({ initial, isNew, onSave, onClose }: { initial: TeamMember; isNew: boolean; onSave: (m: TeamMember) => void; onClose: () => void }) {
  const [m, setM] = useState(initial);
  const [errors, setErrors] = useState<{ name?: string; specialty?: string }>({});
  const submit = () => {
    const e: typeof errors = {};
    if (m.name.trim().length < 3) e.name = 'Escreva o nome completo.';
    if (m.specialty.trim().length < 3) e.specialty = 'Informe a especialidade.';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ name: m.name.trim(), specialty: m.specialty.trim(), cro: m.cro.trim(), bio: m.bio.trim() });
  };
  return (
    <Dialog open onClose={onClose} label={isNew ? 'Novo profissional' : 'Editar profissional'} variant="side" maxWidth="max-w-xl">
      <DialogHeader title={isNew ? 'Novo profissional' : 'Editar profissional'} onClose={onClose} />
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <TextField label="Nome" value={m.name} onChange={(v) => setM({ ...m, name: v })} error={errors.name} placeholder="Ex.: Dra. Maria Souza" maxLength={50} autoFocus />
        <TextField label="Especialidade" value={m.specialty} onChange={(v) => setM({ ...m, specialty: v })} error={errors.specialty} placeholder="Ex.: Ortodontia" maxLength={50} />
        <TextField label="Registro profissional (CRO)" value={m.cro} onChange={(v) => setM({ ...m, cro: v })} placeholder="Ex.: CRO-MT 0000" maxLength={30} hint="Opcional. Se ficar vazio, não aparece no site." />
        <TextArea label="Apresentação curta (opcional)" value={m.bio} onChange={(v) => setM({ ...m, bio: v })} maxLength={160} rows={3} hint="Uma ou duas frases, sem promessas de resultado." />
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
