import type { SiteConfig } from '../config/types';

export const fullAddress = (a: SiteConfig['address']): string =>
  `${a.street}, ${a.district}, ${a.city} - ${a.state}, CEP ${a.postalCode}`;

export const mapsDirectionsUrl = (a: SiteConfig['address']): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(a))}`;

export const stars = (n: number): number => Math.max(0, Math.min(5, Math.round(n)));

export const ratingLabel = (score: number, count: number): string =>
  `${score.toFixed(1).replace('.', ',')} estrelas · ${count} ${count === 1 ? 'avaliação' : 'avaliações'} no Google`;
