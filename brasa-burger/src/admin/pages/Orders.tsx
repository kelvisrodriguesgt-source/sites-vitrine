import { Ban, Bike, Check, ChevronRight, ClipboardCopy, MapPin, Search, ShoppingBag, StickyNote, Store, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatBRL } from '../../lib/money';
import {
  advanceLabel,
  isActive,
  nextStatus,
  type Order,
  orderSummary,
  statusLabel
} from '../../shared/orders';
import { setOrderStatus } from '../../shared/ordersStore';
import { formatDateTime, formatTime, timeAgo } from '../format';
import { useNow } from '../hooks';
import { Dialog, DialogHeader, EmptyState, StatusBadge, useToast } from '../ui';

type Tab = 'andamento' | 'concluidos' | 'cancelados' | 'todos';

const TABS: { id: Tab; label: string; match: (o: Order) => boolean }[] = [
  { id: 'andamento', label: 'Em andamento', match: (o) => isActive(o.status) },
  { id: 'concluidos', label: 'Concluídos', match: (o) => o.status === 'concluido' },
  { id: 'cancelados', label: 'Cancelados', match: (o) => o.status === 'cancelado' },
  { id: 'todos', label: 'Todos', match: () => true }
];

const PAGE = 20;

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function Orders({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<Tab>('andamento');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const now = useNow();
  const toast = useToast();

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, orders.filter(t.match).length])) as Record<Tab, number>, [orders]);

  const list = useMemo(() => {
    const match = TABS.find((t) => t.id === tab)?.match ?? (() => true);
    const q = normalize(query.trim().replace(/^#/, ''));
    let rows = orders.filter(match);
    // Em andamento: os mais antigos primeiro (quem espera há mais tempo aparece no topo).
    if (tab === 'andamento') rows = [...rows].sort((a, b) => a.createdAt - b.createdAt);
    if (q) rows = rows.filter((o) => String(o.number) === q || normalize(o.customer).includes(q) || o.items.some((i) => normalize(i.name).includes(q)));
    return rows;
  }, [orders, tab, query]);

  const open = orders.find((o) => o.id === openId) ?? null;

  const advance = (o: Order) => {
    const next = nextStatus(o.status);
    if (!next) return;
    setOrderStatus(o.id, next);
    toast.push(`Pedido #${o.number}: ${statusLabel(next, o.type).toLowerCase()}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">Pedidos</h1>
        <p className="mt-1 text-char/65">Acompanhe cada pedido do recebimento à entrega.</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filtrar pedidos">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setLimit(PAGE);
            }}
            className={`a-chip ${tab === t.id ? 'a-chip-on' : 'a-chip-off'}`}
          >
            {t.label}
            <span className={`rounded-full px-2 text-xs ${tab === t.id ? 'bg-white/20' : 'bg-char/10'}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/40" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Buscar por nome, número ou produto"
          aria-label="Buscar pedidos"
          className="a-input pl-10"
        />
      </div>

      {list.length === 0 ? (
        <div className="a-card">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" aria-hidden="true" />}
            title={query ? 'Nenhum pedido encontrado' : tab === 'andamento' ? 'Nenhum pedido em andamento' : 'Nada por aqui'}
            text={query ? 'Tente outro nome ou número.' : tab === 'andamento' ? 'Quando chegar um pedido pelo site, ele aparece aqui na hora.' : undefined}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.slice(0, limit).map((o) => {
            const label = advanceLabel(o.status, o.type);
            const qty = o.items.reduce((s, i) => s + i.qty, 0);
            const waiting = o.status === 'novo' && now - o.createdAt > 10 * 60_000;
            return (
              <li key={o.id} className={`a-card overflow-hidden ${o.status === 'novo' ? 'ring-2 ring-tomato/70' : ''}`}>
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 sm:p-5">
                  <button type="button" onClick={() => setOpenId(o.id)} className="flex min-w-0 flex-1 basis-64 items-start gap-4 rounded-lg text-left" aria-label={`Abrir pedido ${o.number} de ${o.customer}`}>
                    <span className="font-display text-3xl leading-none tracking-wide text-wine">#{o.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-heading font-extrabold">{o.customer}</span>
                        <StatusBadge status={o.status} type={o.type} />
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-char/65">
                        <span className={waiting ? 'font-bold text-tomato' : ''}>{timeAgo(o.createdAt, now)}</span>
                        <span className="inline-flex items-center gap-1">
                          {o.type === 'entrega' ? <Bike className="h-4 w-4" aria-hidden="true" /> : <Store className="h-4 w-4" aria-hidden="true" />}
                          {o.type === 'entrega' ? 'Entrega' : 'Retirada'}
                        </span>
                        <span>{qty} item(ns)</span>
                      </span>
                      <span className="mt-1.5 line-clamp-1 text-sm text-char/80">{o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}</span>
                    </span>
                  </button>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                    <span className="font-heading text-xl font-extrabold">{formatBRL(o.totalCents)}</span>
                    <div className="flex items-center gap-2">
                      {label && (
                        <button type="button" onClick={() => advance(o)} className="a-btn a-btn-primary">
                          {label}
                        </button>
                      )}
                      <button type="button" onClick={() => setOpenId(o.id)} aria-label={`Detalhes do pedido ${o.number}`} className="a-icon-btn bg-char/5">
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {list.length > limit && (
        <div className="flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="a-btn a-btn-ghost">
            Ver mais ({list.length - limit})
          </button>
        </div>
      )}

      <OrderDrawer order={open} onClose={() => setOpenId(null)} onAdvance={advance} />
    </div>
  );
}

function OrderDrawer({ order, onClose, onAdvance }: { order: Order | null; onClose: () => void; onAdvance: (o: Order) => void }) {
  const toast = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const close = () => {
    setConfirmCancel(false);
    onClose();
  };

  return (
    <Dialog open={order !== null} onClose={close} label={order ? `Pedido ${order.number}` : 'Pedido'} variant="side" maxWidth="sm:max-w-md">
      {order && (
        <>
          <DialogHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-2xl tracking-wide text-wine">#{order.number}</span>
                <StatusBadge status={order.status} type={order.type} />
              </span>
            }
            subtitle={`Feito em ${formatDateTime(order.createdAt)}`}
            onClose={close}
          />
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <section className="a-card space-y-3 p-4">
              <p className="font-heading text-lg font-extrabold" data-autofocus tabIndex={-1}>
                {order.customer}
              </p>
              <p className="flex items-start gap-2.5 text-sm">
                {order.type === 'entrega' ? <Bike className="mt-0.5 h-4 w-4 shrink-0 text-wine" aria-hidden="true" /> : <Store className="mt-0.5 h-4 w-4 shrink-0 text-wine" aria-hidden="true" />}
                <span>
                  <strong>{order.type === 'entrega' ? 'Entrega' : 'Retirada no balcão'}</strong>
                </span>
              </p>
              {order.address && (
                <p className="flex items-start gap-2.5 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-wine" aria-hidden="true" />
                  <span>{order.address}</span>
                </p>
              )}
              <p className="flex items-start gap-2.5 text-sm">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-wine" aria-hidden="true" />
                <span>{order.payment || 'Pagamento não informado'}</span>
              </p>
              {order.notes && (
                <p className="flex items-start gap-2.5 rounded-lg bg-mustard/25 p-3 text-sm">
                  <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-wine" aria-hidden="true" />
                  <span>
                    <strong>Observação:</strong> {order.notes}
                  </span>
                </p>
              )}
            </section>

            <section className="a-card p-4" aria-label="Itens do pedido">
              <ul className="divide-y divide-char/10">
                {order.items.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0">
                    <span>
                      <strong className="font-heading">{i.qty}x</strong> {i.name}
                    </span>
                    <span className="shrink-0 font-semibold">{formatBRL(i.qty * i.unitCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-baseline justify-between border-t border-char/15 pt-3">
                <span className="a-label">Total</span>
                <span className="font-display text-3xl tracking-wide">{formatBRL(order.totalCents)}</span>
              </div>
              {order.type === 'entrega' && <p className="mt-1 text-xs text-char/55">Taxa de entrega combinada com o cliente.</p>}
            </section>

            <section aria-label="Histórico">
              <p className="a-label mb-3">Histórico</p>
              <ol className="space-y-3 border-l-2 border-char/15 pl-4">
                {order.history.map((h, i) => (
                  <li key={`${h.status}-${h.at}-${i}`} className="relative text-sm">
                    <span className={`absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full border-2 border-paper ${h.status === 'cancelado' ? 'bg-wine' : i === order.history.length - 1 ? 'bg-tomato' : 'bg-char/40'}`} aria-hidden="true" />
                    <strong>{statusLabel(h.status, order.type)}</strong>
                    <span className="text-char/60"> · {formatTime(h.at)}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="space-y-2 border-t border-char/10 bg-white p-4">
            {nextStatus(order.status) && (
              <button type="button" onClick={() => onAdvance(order)} className="a-btn a-btn-primary w-full">
                <Check className="h-4 w-4" aria-hidden="true" />
                {advanceLabel(order.status, order.type)}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(orderSummary(order));
                    toast.push('Resumo copiado');
                  } catch {
                    toast.push('Não foi possível copiar neste navegador', { tone: 'error' });
                  }
                }}
                className="a-btn a-btn-ghost"
              >
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" /> Copiar resumo
              </button>
              {isActive(order.status) ? (
                confirmCancel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatus(order.id, 'cancelado');
                      toast.push(`Pedido #${order.number} cancelado`);
                      setConfirmCancel(false);
                    }}
                    className="a-btn a-btn-danger"
                  >
                    Confirmar
                  </button>
                ) : (
                  <button type="button" onClick={() => setConfirmCancel(true)} className="a-btn a-btn-ghost text-tomato">
                    <Ban className="h-4 w-4" aria-hidden="true" /> Cancelar pedido
                  </button>
                )
              ) : (
                <button type="button" onClick={close} className="a-btn a-btn-dark">
                  Fechar
                </button>
              )}
            </div>
            {confirmCancel && (
              <p className="text-center text-sm text-char/65">
                Cancelar tira o pedido do faturamento.{' '}
                <button type="button" onClick={() => setConfirmCancel(false)} className="font-bold underline">
                  Voltar
                </button>
              </p>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
