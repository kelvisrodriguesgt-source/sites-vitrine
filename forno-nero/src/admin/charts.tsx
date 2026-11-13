import { compactBRL } from './format';

export interface Bar {
  /** Rótulo do eixo X (já abreviado). */
  label: string;
  value: number;
  /** Texto do balão ao passar o mouse ou focar. */
  tip: string;
  highlight?: boolean;
}

/** Gráfico de barras responsivo feito com divs (sem estilos inline além da altura, via CSSOM). */
export function BarChart({ bars, ariaLabel, labelEvery = 1 }: { bars: Bar[]; ariaLabel: string; labelEvery?: number }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const n = bars.length;
  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="relative mt-5 flex h-56 gap-[3px] pl-16 sm:gap-1.5">
        {[0, 0.5, 1].map((f) => (
          <div key={f} className="pointer-events-none absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="w-14 -translate-y-1/2 whitespace-nowrap pr-1 text-right text-[0.68rem] font-semibold text-ink/45">{compactBRL(max * f)}</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>
        ))}
        {bars.map((b, i) => (
          <div key={`${b.label}-${i}`} className="group relative z-10 flex h-full min-w-0 flex-1 flex-col justify-end" tabIndex={0} aria-label={b.tip}>
            <div
              className={`w-full rounded-t-md transition-colors duration-150 ${b.highlight ? 'bg-danger' : 'bg-ember'} group-hover:bg-red group-focus:bg-red`}
              style={{ height: `${b.value > 0 ? Math.max(2, (b.value / max) * 100) : 0}%` }}
            />
            <div
              className={`pointer-events-none absolute bottom-full z-20 mb-1.5 hidden w-max max-w-[11rem] rounded-lg bg-ink px-3 py-2 text-xs font-semibold leading-snug text-white shadow-pop group-hover:block group-focus:block ${
                i < 2 ? 'left-0' : i > n - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              }`}
            >
              {b.tip}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] pl-16 pt-2 sm:gap-1.5" aria-hidden="true">
        {bars.map((b, i) => (
          <div key={`${b.label}-x-${i}`} className="min-w-0 flex-1 text-center text-[0.68rem] font-semibold text-ink/55">
            {i % labelEvery === 0 || i === n - 1 ? <span className="inline-block whitespace-nowrap">{b.label}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Rosca em SVG. As fatias usam atributos (nada de estilo inline). */
export function Donut({ slices, center, sub }: { slices: Slice[]; center: string; sub: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  let offset = 25; // começa no topo
  return (
    <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0" role="img" aria-label={slices.map((s) => `${s.label}: ${s.value}`).join(', ')}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#0B0B0B" strokeOpacity="0.08" strokeWidth="6" />
      {total > 0 &&
        slices.map((s) => {
          const pct = (s.value / total) * 100;
          const el = (
            <circle
              key={s.label}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={s.color}
              strokeWidth="6"
              strokeDasharray={`${Math.max(0, pct - 0.6)} ${100 - Math.max(0, pct - 0.6)}`}
              strokeDashoffset={offset}
            />
          );
          offset -= pct;
          return el;
        })}
      <text x="21" y="21.5" textAnchor="middle" className="fill-ink font-display" fontSize="7">
        {center}
      </text>
      <text x="21" y="27" textAnchor="middle" className="fill-ink/60" fontSize="2.8">
        {sub}
      </text>
    </svg>
  );
}
