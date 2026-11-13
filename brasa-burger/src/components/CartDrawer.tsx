import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { site } from '../config/site';
import { useCart } from '../context/CartContext';
import { formatBRL } from '../lib/money';
import { createOrder } from '../shared/ordersStore';
import { buildOrderMessage, buildWhatsAppUrl, type CheckoutData, type CheckoutErrors, validateCheckout } from '../lib/whatsapp';

type Step = 'cart' | 'checkout' | 'sent';

const EMPTY: CheckoutData = { name: '', type: 'entrega', address: '', payment: '', notes: '' };
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

const field =
  'mt-1.5 block min-h-12 w-full rounded-md border border-char/25 bg-white px-3.5 py-3 text-base text-char placeholder:text-char/40 focus:border-wine focus:outline-none focus:ring-2 focus:ring-mustard';

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
    const found = validateCheckout(form, lines.length);
    setErrors(found);
    const firstInvalid = (['name', 'address', 'payment'] as const).find((k) => found[k]);
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

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-char/70 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        tabIndex={-1}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream text-char shadow-2xl outline-none transition-[transform,visibility] duration-300 ease-out ${
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between bg-char px-5 py-4 text-white">
          <h2 className="font-display text-2xl uppercase tracking-wide">
            {step === 'checkout' ? 'Finalizar pedido' : step === 'sent' ? 'Pedido enviado' : 'Seu pedido'}
          </h2>
          <button type="button" onClick={closeCart} aria-label="Fechar pedido" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {step === 'sent' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mustard text-char">
              <Check className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="font-heading text-xl font-extrabold uppercase">WhatsApp aberto</p>
            {orderNumber && <p className="rounded-md bg-white px-4 py-2 font-heading font-extrabold uppercase text-wine">Pedido #{orderNumber}</p>}
            <p className="text-char/75">{site.order.sentNotice}</p>
            <a href={waUrl} target="_blank" rel="noopener" className="btn btn-tomato w-full">
              ABRIR WHATSAPP DE NOVO
            </a>
            <button type="button" onClick={() => setStep('cart')} className="btn btn-dark w-full">
              VOLTAR AO PEDIDO
            </button>
            <button type="button" onClick={newOrder} className="text-sm font-semibold underline underline-offset-4 hover:text-wine">
              Começar um novo pedido
            </button>
          </div>
        )}

        {step === 'cart' && lines.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <ShoppingBag className="h-14 w-14 text-wine/50" aria-hidden="true" />
            <p className="font-heading text-xl font-extrabold uppercase">Seu pedido está vazio</p>
            <p className="text-char/70">Escolha seus hambúrgueres favoritos no cardápio.</p>
            <button type="button" onClick={goToMenu} className="btn btn-tomato">
              VER CARDÁPIO
            </button>
          </div>
        )}

        {step === 'cart' && lines.length > 0 && (
          <>
            <ul className="flex-1 divide-y divide-char/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.product.id} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading font-extrabold uppercase leading-tight">{l.product.name}</p>
                      <p className="mt-1 text-sm text-char/65">{formatBRL(l.unitCents)} cada</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.product.id)}
                      aria-label={`Remover ${l.product.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-char/55 hover:bg-tomato/10 hover:text-tomato"
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-char/20 bg-white">
                      <button type="button" onClick={() => dec(l.product.id)} aria-label={`Diminuir quantidade de ${l.product.name}`} className="flex h-11 w-11 items-center justify-center hover:text-tomato">
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-9 text-center font-heading font-extrabold" aria-live="polite">
                        {l.qty}
                      </span>
                      <button type="button" onClick={() => inc(l.product.id)} aria-label={`Aumentar quantidade de ${l.product.name}`} className="flex h-11 w-11 items-center justify-center hover:text-tomato">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="font-heading text-lg font-extrabold text-tomato">{formatBRL(l.totalCents)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-char/15 bg-white p-5">
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatBRL(totals.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between font-heading text-lg font-extrabold">
                  <dt>Total</dt>
                  <dd className="text-tomato">{formatBRL(totals.totalCents)}</dd>
                </div>
              </dl>
              <p className="text-xs text-char/60">{site.order.deliveryNote}</p>
              <button type="button" onClick={() => setStep('checkout')} className="btn btn-tomato w-full">
                FINALIZAR PEDIDO
              </button>
              <button type="button" onClick={goToMenu} className="btn w-full border-2 border-char/20 text-char hover:border-wine hover:text-wine">
                CONTINUAR ESCOLHENDO
              </button>
            </div>
          </>
        )}

        {step === 'checkout' && (
          <form onSubmit={submit} noValidate className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <button type="button" onClick={() => setStep('cart')} className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:text-wine hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar ao pedido
              </button>

              <div>
                <label htmlFor="co-name" className="text-sm font-bold">
                  Seu nome
                </label>
                <input id="co-name" name="name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} className={field} />
                {errors.name && (
                  <p id="err-name" role="alert" className="mt-1 text-sm font-semibold text-tomato">
                    {errors.name}
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="text-sm font-bold">Tipo de pedido</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(['entrega', 'retirada'] as const).map((t) => (
                    <label key={t} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border-2 font-heading text-sm font-extrabold uppercase transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mustard ${form.type === t ? 'border-wine bg-wine text-white' : 'border-char/20 bg-white hover:border-wine'}`}>
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
                  <textarea id="co-address" name="address" rows={3} autoComplete="street-address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número, bairro e ponto de referência" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'err-address' : undefined} className={field} />
                  {errors.address && (
                    <p id="err-address" role="alert" className="mt-1 text-sm font-semibold text-tomato">
                      {errors.address}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="co-pay" className="text-sm font-bold">
                  Forma de pagamento
                </label>
                <select id="co-pay" name="payment" value={form.payment} onChange={(e) => set('payment', e.target.value)} aria-invalid={!!errors.payment} aria-describedby={errors.payment ? 'err-pay' : undefined} className={field}>
                  <option value="">Selecione</option>
                  {site.payments.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.payment && (
                  <p id="err-pay" role="alert" className="mt-1 text-sm font-semibold text-tomato">
                    {errors.payment}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="co-notes" className="text-sm font-bold">
                  Observações <span className="font-normal text-char/55">(opcional)</span>
                </label>
                <textarea id="co-notes" name="notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ex.: sem cebola, troco para R$ 50" className={field} />
              </div>
            </div>

            <div className="space-y-3 border-t border-char/15 bg-white p-5">
              <div className="flex justify-between font-heading text-lg font-extrabold">
                <span>Total</span>
                <span className="text-tomato">{formatBRL(totals.totalCents)}</span>
              </div>
              <p className="text-xs text-char/60">{site.order.deliveryNote} Ao enviar, abriremos o WhatsApp com o pedido pronto.</p>
              <button type="submit" className="btn btn-tomato w-full">
                ENVIAR PEDIDO PELO WHATSAPP
              </button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
