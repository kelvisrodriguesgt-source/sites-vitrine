import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { useCart } from '../context/CartContext';
import type { CartLine } from '../lib/cart';
import { formatBRL } from '../lib/money';
import { createOrder } from '../shared/ordersStore';
import { buildOrderMessage, buildWhatsAppUrl, type CheckoutData, type CheckoutErrors, isCash, validateCheckout } from '../lib/whatsapp';

type Step = 'cart' | 'checkout' | 'sent';

const EMPTY: CheckoutData = { name: '', type: 'entrega', address: '', payment: '', changeFor: '', notes: '' };
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

function LineTitle({ l }: { l: CartLine }) {
  if (l.other && l.size) {
    return (
      <>
        <span className="block font-extrabold leading-tight">Pizza {l.size.id} meio a meio</span>
        <span className="mt-0.5 block text-sm text-ash">
          {l.product.name} / {l.other.name}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="block font-extrabold leading-tight">{l.product.name}</span>
      {l.size && (
        <span className="mt-0.5 block text-sm text-ash">
          {l.size.label} · {l.size.slices} fatias
        </span>
      )}
    </>
  );
}

export function CartDrawer() {
  const { open, closeCart, lines, totals, inc, dec, remove, clear } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState<CheckoutData>(EMPTY);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [waUrl, setWaUrl] = useState('');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Bloqueia a rolagem do fundo, move o foco para o painel e devolve ao fechar.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener.current?.focus?.();
    };
  }, [open, closeCart]);

  useEffect(() => {
    if (lines.length === 0 && step === 'checkout') setStep('cart');
  }, [lines.length, step]);

  const set = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goToMenu = () => {
    closeCart();
    window.setTimeout(() => document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateCheckout(form, lines);
    setErrors(found);
    const firstInvalid = (['name', 'address', 'payment', 'changeFor'] as const).find((k) => found[k]);
    if (firstInvalid) {
      panel.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (Object.keys(found).length) return;
    // Registra o pedido no painel (modo demonstração) antes de abrir o WhatsApp; se falhar, o envio segue normalmente.
    const order = createOrder(form, lines);
    setOrderNumber(order?.number ?? null);
    const text = buildOrderMessage({ brandName: site.brand.name, demo: site.brand.demo, lines, checkout: form, orderNumber: order?.number });
    const url = buildWhatsAppUrl(site.contact.whatsapp, text);
    setWaUrl(url);
    window.open(url, '_blank', 'noopener');
    setStep('sent');
  };

  const newOrder = () => {
    clear();
    setForm(EMPTY);
    setStep('cart');
  };

  const err = (id: string, text?: string) =>
    text ? (
      <p id={id} role="alert" className="mt-1 text-sm font-semibold text-ember">
        {text}
      </p>
    ) : null;

  return (
    <>
      <div onClick={closeCart} aria-hidden="true" className={`fixed inset-0 z-50 bg-ink/80 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        tabIndex={-1}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-coal text-snow shadow-2xl outline-none transition-[transform,visibility] duration-300 ease-out ${open ? 'visible translate-x-0' : 'invisible translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-extrabold tracking-tight">{step === 'checkout' ? 'Finalizar pedido' : step === 'sent' ? 'Pedido enviado' : 'Seu pedido'}</h2>
          <button type="button" onClick={closeCart} aria-label="Fechar pedido" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {step === 'sent' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ember text-ink">
              <Check className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="text-xl font-extrabold">WhatsApp aberto</p>
            {orderNumber && <p className="rounded-full bg-card px-4 py-2 font-extrabold text-ember">Pedido #{orderNumber}</p>}
            <p className="text-ash">{site.order.sentNotice}</p>
            <a href={waUrl} target="_blank" rel="noopener" className="btn btn-whats w-full">
              Abrir WhatsApp de novo
            </a>
            <button type="button" onClick={() => setStep('cart')} className="btn btn-outline w-full">
              Voltar ao pedido
            </button>
            <button type="button" onClick={newOrder} className="text-sm font-semibold underline underline-offset-4 hover:text-ember">
              Começar um novo pedido
            </button>
          </div>
        )}

        {step === 'cart' && lines.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <ShoppingBag className="h-14 w-14 text-ember/60" strokeWidth={1.3} aria-hidden="true" />
            <p className="text-xl font-extrabold">Seu pedido está vazio</p>
            <p className="text-ash">Escolha suas pizzas favoritas no cardápio.</p>
            <button type="button" onClick={goToMenu} className="btn btn-red">
              Ver cardápio
            </button>
          </div>
        )}

        {step === 'cart' && lines.length > 0 && (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.key} className="py-5" data-testid="cart-line">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <LineTitle l={l} />
                      <span className="mt-1 block text-sm text-ash">{formatBRL(l.unitCents)} cada</span>
                    </div>
                    <button type="button" onClick={() => remove(l.key)} aria-label={`Remover ${l.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ash hover:bg-white/10 hover:text-snow">
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line bg-card">
                      <button type="button" onClick={() => dec(l.key)} aria-label={`Diminuir quantidade de ${l.name}`} className="flex h-11 w-11 items-center justify-center hover:text-ember">
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-9 text-center font-extrabold" aria-live="polite">
                        {l.qty}
                      </span>
                      <button type="button" onClick={() => inc(l.key)} aria-label={`Aumentar quantidade de ${l.name}`} className="flex h-11 w-11 items-center justify-center hover:text-ember">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-lg font-extrabold">{formatBRL(l.totalCents)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line bg-card p-5">
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-ash">
                  <dt>Subtotal</dt>
                  <dd>{formatBRL(totals.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between text-lg font-extrabold">
                  <dt>Total</dt>
                  <dd>{formatBRL(totals.totalCents)}</dd>
                </div>
              </dl>
              <p className="text-xs text-ash">{site.order.deliveryNote}</p>
              <button type="button" onClick={() => setStep('checkout')} className="btn btn-red w-full">
                Finalizar pedido
              </button>
              <button type="button" onClick={goToMenu} className="btn btn-outline w-full">
                Continuar escolhendo
              </button>
            </div>
          </>
        )}

        {step === 'checkout' && (
          <form onSubmit={submit} noValidate className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <button type="button" onClick={() => setStep('cart')} className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:text-ember hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar ao pedido
              </button>

              <div>
                <label htmlFor="co-name" className="text-sm font-bold">
                  Seu nome
                </label>
                <input id="co-name" name="name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} className="field" />
                {err('err-name', errors.name)}
              </div>

              <fieldset>
                <legend className="text-sm font-bold">Tipo de pedido</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(['entrega', 'retirada'] as const).map((t) => (
                    <label key={t} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-extrabold uppercase transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${form.type === t ? 'border-red bg-red text-snow' : 'border-line bg-card hover:border-snow'}`}>
                      <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} className="sr-only" />
                      {t === 'entrega' ? 'Entrega' : 'Retirada'}
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.type === 'entrega' && (
                <div>
                  <label htmlFor="co-address" className="text-sm font-bold">
                    Endereço de entrega
                  </label>
                  <textarea id="co-address" name="address" rows={3} autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número, bairro e ponto de referência" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'err-address' : undefined} className="field" />
                  {err('err-address', errors.address)}
                </div>
              )}

              <div>
                <label htmlFor="co-pay" className="text-sm font-bold">
                  Forma de pagamento
                </label>
                <select id="co-pay" name="payment" value={form.payment} onChange={(e) => set('payment', e.target.value)} aria-invalid={!!errors.payment} aria-describedby={errors.payment ? 'err-pay' : undefined} className="field">
                  <option value="">Selecione</option>
                  {site.payments.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {err('err-pay', errors.payment)}
              </div>

              {isCash(form.payment) && (
                <div>
                  <label htmlFor="co-change" className="text-sm font-bold">
                    Troco para quanto? <span className="font-normal text-ash">(opcional)</span>
                  </label>
                  <input id="co-change" name="changeFor" inputMode="decimal" value={form.changeFor} onChange={(e) => set('changeFor', e.target.value)} placeholder="Ex.: 100" aria-invalid={!!errors.changeFor} aria-describedby={errors.changeFor ? 'err-change' : undefined} className="field" />
                  {err('err-change', errors.changeFor)}
                </div>
              )}

              <div>
                <label htmlFor="co-notes" className="text-sm font-bold">
                  Observações <span className="font-normal text-ash">(opcional)</span>
                </label>
                <textarea id="co-notes" name="notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ex.: sem cebola, cortar em 12 pedaços" className="field" />
              </div>
            </div>

            <div className="space-y-3 border-t border-line bg-card p-5">
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>{formatBRL(totals.totalCents)}</span>
              </div>
              <p className="text-xs text-ash">
                {site.order.deliveryNote} {site.order.sentNotice}
              </p>
              <button type="submit" className="btn btn-whats w-full">
                Enviar pedido pelo WhatsApp
              </button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
