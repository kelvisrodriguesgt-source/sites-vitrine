import { Banknote, ChefHat, ChevronRight, Receipt, ShoppingBag, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatBRL } from '../../lib/money';
import type { Order } from '../../shared/orders';
import { isDemoOn } from '../../shared/ordersStore';
import {
  activeCount,
  breakdown,
  dailySeries,
  dayKey,
  delta,
  hourlySeries,
  kpis,
  type Period,
  PERIODS,
  periodDays,
  topProducts
} from '../../shared/stats';
import { type Bar, BarChart, Donut } from '../charts';
import { dayLong, dayShort, formatPct, timeAgo } from '../format';
import { useNow } from '../hooks';
import { EmptyState, StatusBadge } from '../ui';

const COLORS = ['#E53935', '#E8751A', '#A3A3A3', '#0B0B0B'];

function Delta({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <span className="text-xs font-semibold text-ink/55">novo {label}</span>;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-heading font-extrabold ${up ? 'bg-emerald-100 text-emerald-800' : 'bg-danger/15 text-danger'}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {formatPct(value)}
      </span>
      {label}
    </span>
  );
}

function Kpi({ label, value, icon: Icon, foot, href }: { label: string; value: string; icon: typeof Banknote; foot: React.ReactNode; href?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="a-label">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember/25 text-red">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-lg leading-none tracking-tight min-[400px]:text-xl sm:text-2xl">{value}</p>
      <div className="mt-3">{foot}</div>
    </>
  );
  const cls = 'a-card block p-5';
  return href ? (
    <a href={href} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-pop`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Dashboard({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<Period>('7d');
  const now = useNow();
  const { days, previous } = useMemo(() => periodDays(period, now), [period, now]);

  const cur = useMemo(() => kpis(orders, days), [orders, days]);
  const prev = useMemo(() => kpis(orders, previous), [orders, previous]);
  const active = activeCount(orders);
  const novos = orders.filter((o) => o.status === 'novo').length;
  const top = useMemo(() => topProducts(orders, days, 5), [orders, days]);
  const byType = useMemo(() => breakdown(orders, days, 'type'), [orders, days]);
  const byPay = useMemo(() => breakdown(orders, days, 'payment'), [orders, days]);
  const recent = orders.slice(0, 6);
  const prevLabel = period === 'hoje' ? 'vs. ontem' : `vs. ${days.length} dias antes`;

  const bars: Bar[] = useMemo(() => {
    if (period === 'hoje') {
      const day = days[0] ?? dayKey(now);
      const curHour = new Date(now).getHours();
      return hourlySeries(orders, day)
        .slice(10, 24)
        .map((h) => ({
          label: `${h.hour}h`,
          value: h.revenueCents,
          highlight: h.hour === curHour,
          tip: `${h.hour}h · ${h.count} pedido${h.count === 1 ? '' : 's'} · ${formatBRL(h.revenueCents)}`
        }));
    }
    return dailySeries(orders, days).map((d, i, arr) => ({
      label: dayShort(d.day),
      value: d.revenueCents,
      highlight: i === arr.length - 1,
      tip: `${dayLong(d.day)} · ${d.count} pedido${d.count === 1 ? '' : 's'} · ${formatBRL(d.revenueCents)}`
    }));
  }, [orders, days, period, now]);

  const typeTotal = byType.reduce((s, x) => s + x.count, 0);
  const maxTop = Math.max(1, ...top.map((t) => t.qty));
  const demo = isDemoOn() && orders.some((o) => o.source === 'demo');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Visão geral</h1>
          <p className="mt-1 text-ink/65">Como estão as vendas da loja.</p>
        </div>
        <div role="group" aria-label="Período" className="flex rounded-xl bg-white p-1 shadow-card">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`min-h-10 rounded-lg px-4 font-heading text-sm font-bold transition ${period === p.id ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/5'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {demo && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ember/60 bg-ember/20 px-4 py-3 text-sm">
          <p>
            <strong className="font-heading">Dados de exemplo.</strong> Estes números são fictícios, para você ver o painel funcionando. Pedidos feitos no site aparecem aqui junto com eles.
          </p>
          <a href="#/config" className="a-btn a-btn-ghost min-h-10 py-1.5">
            Gerenciar exemplos
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi label="Faturamento" value={formatBRL(cur.revenueCents)} icon={Banknote} foot={<Delta value={delta(cur.revenueCents, prev.revenueCents)} label={prevLabel} />} />
        <Kpi label="Pedidos" value={String(cur.orders)} icon={ShoppingBag} foot={<Delta value={delta(cur.orders, prev.orders)} label={prevLabel} />} />
        <Kpi label="Ticket médio" value={formatBRL(cur.avgTicketCents)} icon={Receipt} foot={<Delta value={delta(cur.avgTicketCents, prev.avgTicketCents)} label={prevLabel} />} />
        <Kpi
          label="Em andamento"
          value={String(active)}
          icon={ChefHat}
          href="#/pedidos"
          foot={<span className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60">{novos > 0 ? <strong className="font-heading text-danger">{novos} novo{novos === 1 ? '' : 's'} aguardando</strong> : 'Tudo em dia'}<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></span>}
        />
      </div>

      <section className="a-card p-5 sm:p-6" aria-labelledby="graf-titulo">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="graf-titulo" className="font-heading text-lg font-extrabold">
            {period === 'hoje' ? 'Faturamento por hora' : 'Faturamento por dia'}
          </h2>
          <p className="text-sm text-ink/60">
            {cur.canceled > 0 ? `${cur.canceled} cancelado${cur.canceled === 1 ? '' : 's'} fora da conta` : 'Pedidos cancelados ficam fora da conta'}
          </p>
        </div>
        <BarChart bars={bars} ariaLabel={`Faturamento ${period === 'hoje' ? 'por hora, hoje' : `por dia, ${days.length} dias`}`} labelEvery={period === '30d' ? 3 : 1} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="a-card p-5 sm:p-6" aria-labelledby="tipo-titulo">
          <h2 id="tipo-titulo" className="font-heading text-lg font-extrabold">
            Entrega ou retirada
          </h2>
          {typeTotal === 0 ? (
            <p className="mt-6 text-ink/60">Sem pedidos neste período.</p>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <Donut slices={byType.map((s, i) => ({ label: s.label, value: s.count, color: COLORS[i % COLORS.length] as string }))} center={String(typeTotal)} sub="pedidos" />
              <ul className="min-w-0 flex-1 space-y-3">
                {byType.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} aria-hidden="true" />
                    <span className="flex-1 font-semibold">{s.label}</span>
                    <span className="text-sm text-ink/65">
                      {s.count} · {Math.round((s.count / typeTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {byPay.length > 0 && (
            <div className="mt-6 border-t border-ink/10 pt-4">
              <p className="a-label">Formas de pagamento</p>
              <ul className="mt-3 space-y-2.5">
                {byPay.slice(0, 4).map((s) => (
                  <li key={s.label} className="text-sm">
                    <div className="flex justify-between font-semibold">
                      <span>{s.label}</span>
                      <span className="text-ink/65">{Math.round((s.count / typeTotal) * 100)}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-red" style={{ width: `${(s.count / typeTotal) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="a-card p-5 sm:p-6" aria-labelledby="top-titulo">
          <h2 id="top-titulo" className="font-heading text-lg font-extrabold">
            Mais vendidos
          </h2>
          {top.length === 0 ? (
            <p className="mt-6 text-ink/60">Sem vendas neste período.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {top.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-lg ${i === 0 ? 'bg-ember text-ink' : 'bg-ink/10 text-ink/70'}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="truncate font-semibold">{t.name}</span>
                      <span className="shrink-0 text-ink/65">{t.qty} un · {formatBRL(t.revenueCents)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${(t.qty / maxTop) * 100}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="a-card overflow-hidden" aria-labelledby="rec-titulo">
        <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
          <h2 id="rec-titulo" className="font-heading text-lg font-extrabold">
            Últimos pedidos
          </h2>
          <a href="#/pedidos" className="inline-flex items-center gap-1 font-heading text-sm font-bold text-red hover:underline">
            Ver todos <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="h-6 w-6" aria-hidden="true" />} title="Nenhum pedido ainda" text="Quando um cliente finalizar um pedido no site, ele aparece aqui na hora." />
        ) : (
          <ul className="divide-y divide-ink/10">
            {recent.map((o) => (
              <li key={o.id}>
                <a href="#/pedidos" className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-ink/5 sm:px-6">
                  <span className="w-14 shrink-0 font-display text-lg tracking-tight text-red">#{o.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{o.customer}</span>
                    <span className="block truncate text-sm text-ink/60">
                      {timeAgo(o.createdAt, now)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(ns)
                    </span>
                  </span>
                  <span className="hidden font-heading font-extrabold sm:block">{formatBRL(o.totalCents)}</span>
                  <StatusBadge status={o.status} type={o.type} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
