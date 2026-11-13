/** Converte reais (ex.: 32.9) em centavos inteiros, evitando erro de ponto flutuante. */
export const toCents = (reais: number): number => Math.round(reais * 100);

/** Formata centavos como "R$ 1.234,56" com espaço comum (seguro para mensagens de WhatsApp). */
export function formatBRL(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const reais = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(abs % 100).padStart(2, '0');
  return `${negative ? '-' : ''}R$ ${reais},${centavos}`;
}
