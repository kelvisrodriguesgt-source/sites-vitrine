/* Único lugar para preencher IDs. Vazio = nada de terceiros é carregado e nenhum aviso aparece. */
export const TRACKING = {
  metaPixelId: '', // ex.: '123456789012345'
  ga4Id: '' // ex.: 'G-XXXXXXXXXX'
};

/* Observabilidade (só roda depois do consentimento "Aceitar").
 * endpoint: URL que recebe os eventos (seu coletor OpenTelemetry, Datadog, New Relic ou Sentry via proxy).
 * Vazio = nada é enviado. */
export const OBSERVABILITY = {
  endpoint: '',
  sampleRate: 1
};
