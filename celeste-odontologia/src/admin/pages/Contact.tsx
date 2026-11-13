import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { HoursRow } from '../../config/types';
import { cleanInstagram, formatPhone, isValidWhatsapp, parseMapEmbed, toWhatsappNumber } from '../../shared/content';
import type { ContentAdmin } from '../hooks';
import { useDraft } from '../hooks';
import { PageHeader, SaveBar, TextArea, TextField, Tip, useSaved } from '../ui';

interface Form {
  whatsapp: string;
  phone: string;
  instagram: string;
  greeting: string;
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  map: string;
  directions: string;
  hours: HoursRow[];
}

type Errors = Partial<Record<'whatsapp' | 'phone' | 'instagram' | 'street' | 'city' | 'state' | 'postalCode' | 'map' | 'directions' | 'greeting', string>>;

export function Contact({ admin }: { admin: ContentAdmin }) {
  const info = admin.content.info;
  const saved = useSaved();
  const initial: Form = {
    whatsapp: formatPhone(info.contact.whatsapp),
    phone: info.contact.phone,
    instagram: info.contact.instagramHandle,
    greeting: info.contact.greeting,
    street: info.address.street,
    district: info.address.district,
    city: info.address.city,
    state: info.address.state,
    postalCode: info.address.postalCode,
    map: info.address.mapEmbedSrc,
    directions: info.address.directionsUrl,
    hours: info.hours
  };
  const { draft, setDraft, dirty, discard, markSaved } = useDraft(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = () => {
    const e: Errors = {};
    const wa = toWhatsappNumber(draft.whatsapp);
    if (!isValidWhatsapp(wa)) e.whatsapp = 'Digite o número com DDD. Ex.: (65) 99999-0000.';
    if (draft.phone.trim().length < 8) e.phone = 'Informe o telefone (pode ser o mesmo do WhatsApp).';
    const user = cleanInstagram(draft.instagram);
    if (!user) e.instagram = 'Digite só o nome de usuário. Ex.: @minhaclinica.';
    if (draft.street.trim().length < 3) e.street = 'Informe a rua e o número.';
    if (draft.city.trim().length < 2) e.city = 'Informe a cidade.';
    if (!/^[A-Za-z]{2}$/.test(draft.state.trim())) e.state = 'Use a sigla com 2 letras (ex.: MT).';
    if (draft.postalCode.trim().length < 8) e.postalCode = 'Informe o CEP.';
    const map = parseMapEmbed(draft.map);
    if (map === null) e.map = 'Esse não parece o código do Google Maps. Veja o passo a passo abaixo do campo.';
    if (draft.directions.trim() && !/^https:\/\/\S+$/.test(draft.directions.trim())) e.directions = 'O link precisa começar com https://';
    if (draft.greeting.trim().length < 10) e.greeting = 'Escreva a mensagem que o paciente envia ao clicar nos botões.';
    setErrors(e);
    if (Object.keys(e).length) return;

    const digits = draft.phone.replace(/\D/g, '');
    const next = {
      ...info,
      contact: {
        ...info.contact,
        whatsapp: wa,
        whatsappDisplay: formatPhone(wa),
        phone: draft.phone.trim(),
        phoneTel: digits.length >= 10 ? `+55${digits.replace(/^55(?=\d{10,11}$)/, '')}` : info.contact.phoneTel,
        instagramHandle: `@${user}`,
        instagramUrl: `https://www.instagram.com/${user}/`,
        greeting: draft.greeting.trim()
      },
      address: {
        ...info.address,
        street: draft.street.trim(),
        district: draft.district.trim(),
        city: draft.city.trim(),
        state: draft.state.trim().toUpperCase(),
        postalCode: draft.postalCode.trim(),
        mapEmbedSrc: map ?? '',
        directionsUrl: draft.directions.trim()
      },
      hours: draft.hours.filter((h) => h.label.trim() && h.time.trim()).map((h) => ({ ...h, label: h.label.trim(), time: h.time.trim() }))
    };
    const ok = admin.save('info', next);
    if (ok) markSaved();
    saved(ok, 'Contato salvo.');
  };

  const waNumber = toWhatsappNumber(draft.whatsapp);
  const mapOk = parseMapEmbed(draft.map);

  return (
    <>
      <PageHeader title="Contato e horários" intro="Telefone, endereço, horários e mapa. É o que o paciente usa para falar com você e chegar até a clínica." />
      <div className="space-y-5 pb-24">
        <section className="a-card space-y-5 p-5 sm:p-6" aria-labelledby="c-wa">
          <h2 id="c-wa" className="a-h2">WhatsApp e telefone</h2>
          <TextField label="WhatsApp que recebe os pedidos de agendamento" value={draft.whatsapp} onChange={(v) => set('whatsapp', v)} error={errors.whatsapp} inputMode="tel" placeholder="(65) 99999-0000" hint="Todos os botões do site abrem conversa com este número." />
          <TextField label="Telefone fixo ou outro telefone" value={draft.phone} onChange={(v) => set('phone', v)} error={errors.phone} inputMode="tel" placeholder="(65) 3000-0000" />
          <TextField label="Instagram" value={draft.instagram} onChange={(v) => set('instagram', v)} error={errors.instagram} placeholder="@minhaclinica" hint="Só o nome de usuário. O link é criado automaticamente." />
          <div>
            <TextArea label="Mensagem que o paciente envia ao clicar em “Agendar”" value={draft.greeting} onChange={(v) => set('greeting', v)} error={errors.greeting} maxLength={200} rows={2} />
            <div className="mt-3 rounded-2xl bg-mist/60 p-4" aria-label="Prévia da conversa">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-navy/60">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Assim chega no WhatsApp {isValidWhatsapp(waNumber) ? formatPhone(waNumber) : ''}
              </p>
              <p className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-emerald-100 px-4 py-2.5 text-sm text-emerald-950">{draft.greeting || '…'}</p>
            </div>
          </div>
        </section>

        <section className="a-card space-y-5 p-5 sm:p-6" aria-labelledby="c-end">
          <h2 id="c-end" className="a-h2">Endereço</h2>
          <TextField label="Rua e número" value={draft.street} onChange={(v) => set('street', v)} error={errors.street} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Bairro" value={draft.district} onChange={(v) => set('district', v)} />
            <TextField label="CEP" value={draft.postalCode} onChange={(v) => set('postalCode', v)} error={errors.postalCode} inputMode="numeric" placeholder="00000-000" />
            <TextField label="Cidade" value={draft.city} onChange={(v) => set('city', v)} error={errors.city} />
            <TextField label="Estado (sigla)" value={draft.state} onChange={(v) => set('state', v.toUpperCase().slice(0, 2))} error={errors.state} placeholder="MT" />
          </div>
        </section>

        <section className="a-card space-y-5 p-5 sm:p-6" aria-labelledby="c-hor">
          <h2 id="c-hor" className="a-h2">Horários de atendimento</h2>
          <ul className="space-y-3">
            {draft.hours.map((h, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: linhas editáveis sem identificador próprio
              <li key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <TextField label={i === 0 ? 'Dias' : `Dias (linha ${i + 1})`} value={h.label} onChange={(v) => set('hours', draft.hours.map((x, j) => (j === i ? { ...x, label: v } : x)))} placeholder="Segunda a sexta" />
                <TextField label="Horário" value={h.time} onChange={(v) => set('hours', draft.hours.map((x, j) => (j === i ? { ...x, time: v } : x)))} placeholder="8h às 18h" className="order-last col-span-2 sm:order-none sm:col-span-1" />
                <button type="button" className="a-icon-btn mb-1 hover:bg-rose-50 hover:text-rose-700" aria-label={`Remover linha ${i + 1} de horários`} onClick={() => set('hours', draft.hours.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="a-btn a-btn-ghost" onClick={() => set('hours', [...draft.hours, { label: '', time: '', days: '', opens: '', closes: '' }])}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar linha
          </button>
          <p className="a-hint">Para dia sem atendimento, escreva “Fechado” no horário.</p>
        </section>

        <section className="a-card space-y-5 p-5 sm:p-6" aria-labelledby="c-map">
          <h2 id="c-map" className="a-h2">Mapa e rota</h2>
          <TextArea
            label="Código do mapa do Google (opcional)"
            value={draft.map}
            onChange={(v) => set('map', v)}
            error={errors.map}
            rows={3}
            hint={
              <>
                No Google Maps: busque o endereço → <strong>Compartilhar</strong> → <strong>Incorporar um mapa</strong> → <strong>Copiar HTML</strong> e cole aqui. Pode colar o código inteiro. Vazio = o site mostra um espaço reservado.
              </>
            }
          />
          {mapOk ? <iframe title="Prévia do mapa" src={mapOk} loading="lazy" className="h-56 w-full rounded-2xl border-0" /> : null}
          <TextField label="Link do botão “Como chegar” (opcional)" value={draft.directions} onChange={(v) => set('directions', v)} error={errors.directions} inputMode="url" placeholder="https://maps.app.goo.gl/…" hint="Vazio = o botão abre o Google Maps buscando pelo endereço acima." />
        </section>

        <Tip tone="warn">Confira endereço, telefone e horários: eles devem ser idênticos ao Perfil da Empresa no Google.</Tip>
      </div>
      <SaveBar dirty={dirty} onSave={save} onDiscard={() => { discard(); setErrors({}); }} />
    </>
  );
}
