const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (ts: number): string => dateTime.format(ts).replace(', ', ' às ');
export const formatTime = (ts: number): string => time.format(ts);

/** "2026-11-13" -> "13/11". */
export const dayShort = (day: string): string => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** "2026-11-13" -> "sex 13/11". */
export function dayLong(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]} ${dayShort(day)}`;
}

export function timeAgo(ts: number, now: number): string {
  const min = Math.max(0, Math.round((now - ts) / 60_000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  return formatDateTime(ts);
}

/** Valor curto para eixos de gráfico: 850 -> "R$ 850", 1250 -> "R$ 1,3 mil". */
export function compactBRL(cents: number): string {
  const reais = cents / 100;
  if (reais >= 1000) return `R$ ${(reais / 1000).toFixed(1).replace('.', ',').replace(',0', '')} mil`;
  return `R$ ${Math.round(reais)}`;
}

export function formatPct(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}
