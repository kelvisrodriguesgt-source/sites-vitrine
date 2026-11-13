import { ClipboardList, ExternalLink, LayoutDashboard, LogOut, Package, Settings as SettingsIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Logo';
import { site } from '../config/site';
import { syncDemoOrders } from '../shared/ordersStore';
import { SESSION_KEY, ROUTES, type Route } from './config';
import { useHashRoute, useOrders } from './hooks';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';
import { Products } from './pages/Products';
import { Settings } from './pages/Settings';
import { ToastProvider, useToast } from './ui';

const NAV: { id: Route; label: string; icon: typeof Package }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'config', label: 'Configurações', icon: SettingsIcon }
];

const TITLES: Record<Route, string> = {
  dashboard: 'Dashboard',
  pedidos: 'Pedidos',
  produtos: 'Produtos',
  config: 'Configurações'
};

function readSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function AdminApp() {
  const [logged, setLogged] = useState(readSession);

  const login = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* sem sessionStorage: vale só até recarregar */
    }
    setLogged(true);
  };
  const logout = () => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignora */
    }
    setLogged(false);
  };

  return (
    <ToastProvider>
      {logged ? <Shell onLogout={logout} /> : <Login onLogin={login} />}
    </ToastProvider>
  );
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const route = useHashRoute(ROUTES, 'dashboard');
  // Mantém os pedidos de exemplo em dia (uma vez por dia) ANTES de ler os pedidos pela primeira vez.
  useState(() => {
    syncDemoOrders(Date.now(), site.products, site.payments);
    return true;
  });
  const orders = useOrders();
  const toast = useToast();

  const novos = orders.filter((o) => o.status === 'novo').length;

  // Aviso quando chega um pedido do site (inclusive de outra aba).
  const known = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (known.current) {
      const fresh = orders.filter((o) => o.source === 'site' && !known.current?.has(o.id));
      const latest = fresh[0];
      if (latest) toast.push(`Novo pedido #${latest.number} de ${latest.customer}`, { actionLabel: 'Ver', onAction: () => { window.location.hash = '#/pedidos'; }, ms: 8000 });
    }
    known.current = ids;
  }, [orders, toast]);

  useEffect(() => {
    document.title = `${TITLES[route]} | Painel ${site.brand.name}`;
  }, [route]);

  const page: ReactNode =
    route === 'dashboard' ? <Dashboard orders={orders} /> : route === 'pedidos' ? <Orders orders={orders} /> : route === 'produtos' ? <Products /> : <Settings orders={orders} />;

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Menu lateral (computador) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Logo />
          <p className="mt-2 pl-[42px] font-heading text-[0.65rem] font-extrabold uppercase tracking-[0.25em] text-ember">Painel da loja</p>
        </div>
        <nav aria-label="Principal" className="flex-1 space-y-1 px-3">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = route === id;
            return (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 font-heading text-sm font-bold transition ${active ? 'bg-ember text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {id === 'pedidos' && novos > 0 && (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-extrabold text-white" aria-label={`${novos} pedidos novos`}>
                    {novos}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noopener" className="flex min-h-11 items-center gap-3 rounded-xl px-4 font-heading text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5" aria-hidden="true" /> Ver o site
          </a>
          <button type="button" onClick={onLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 font-heading text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" aria-hidden="true" /> Sair
          </button>
        </div>
      </aside>

      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo className="[&_span.font-display]:text-xl" />
        <div className="flex items-center">
          <a href="/" target="_blank" rel="noopener" aria-label="Ver o site" className="a-icon-btn text-white/80 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
          <button type="button" onClick={onLogout} aria-label="Sair" className="a-icon-btn text-white/80 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">{page}</main>

      {/* Abas inferiores (celular) */}
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = route === id;
          return (
            <a key={id} href={`#/${id}`} aria-current={active ? 'page' : undefined} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 font-heading text-[0.7rem] font-bold ${active ? 'text-red' : 'text-ink/55'}`}>
              {active && <span className="absolute inset-x-5 top-0 h-1 rounded-b bg-ember" aria-hidden="true" />}
              <span className="relative">
                <Icon className="h-6 w-6" aria-hidden="true" />
                {id === 'pedidos' && novos > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-5 rounded-full bg-danger px-1 text-center text-[0.65rem] font-extrabold leading-5 text-white" aria-label={`${novos} pedidos novos`}>
                    {novos}
                  </span>
                )}
              </span>
              {label === 'Configurações' ? 'Config.' : label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
