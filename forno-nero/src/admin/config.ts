/**
 * Senha do painel de DEMONSTRAÇÃO. Ela fica no código do navegador, então NÃO protege nada de verdade:
 * serve apenas para mostrar a tela de login. Em produção, o acesso é feito por um servidor (veja o README).
 */
export const DEMO_PASSWORD = 'forno123';
export const SESSION_KEY = 'forno_admin_session';

export const ROUTES = ['dashboard', 'pedidos', 'produtos', 'config'] as const;
export type Route = (typeof ROUTES)[number];
