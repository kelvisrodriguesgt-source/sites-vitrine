import { CircleHelp, ExternalLink, Hash, House, Image, LogOut, Menu, Phone, Sparkles, Type, Users } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Logo } from '../components/ui';
import { defaultContent } from '../config/site';
import { ROUTES, type Route, SESSION_KEY } from './config';
import { useContentAdmin, useHashRoute } from './hooks';
import { Contact } from './pages/Contact';
import { Faq } from './pages/Faq';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Numbers } from './pages/Numbers';
import { Photos } from './pages/Photos';
import { Team } from './pages/Team';
import { Texts } from './pages/Texts';
import { Treatments } from './pages/Treatments';
import { Dialog, DialogHeader, ToastProvider } from './ui';

const NAV: { id: Route; label: string; short: string; icon: typeof House }[] = [
  { id: 'inicio', label: 'Início', short: 'Início', icon: House },
  { id: 'tratamentos', label: 'Tratamentos', short: 'Trat.', icon: Sparkles },
  { id: 'fotos', label: 'Fotos do site', short: 'Fotos', icon: Image },
  { id: 'contato', label: 'Contato e horários', short: 'Contato', icon: Phone },
  { id: 'equipe', label: 'Equipe', short: 'Equipe', icon: Users },
  { id: 'perguntas', label: 'Perguntas frequentes', short: 'Perguntas', icon: CircleHelp },
  { id: 'textos', label: 'Textos do site', short: 'Textos', icon: Type },
  { id: 'numeros', label: 'Números e diferenciais', short: 'Números', icon: Hash }
];
const BOTTOM: Route[] = ['inicio', 'tratamentos', 'fotos', 'contato'];

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
  return <ToastProvider>{logged ? <Shell onLogout={logout} /> : <Login onLogin={login} />}</ToastProvider>;
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const route = useHashRoute(ROUTES, 'inicio');
  const admin = useContentAdmin();
  const [more, setMore] = useState(false);
  const { brand } = defaultContent.info;
  const title = NAV.find((n) => n.id === route)?.label ?? 'Início';

  useEffect(() => {
    document.title = `${title} | Painel ${brand.name}`;
    setMore(false);
  }, [route, title, brand.name]);

  const page: ReactNode = {
    inicio: <Home admin={admin} />,
    tratamentos: <Treatments admin={admin} />,
    equipe: <Team admin={admin} />,
    perguntas: <Faq admin={admin} />,
    contato: <Contact admin={admin} />,
    textos: <Texts admin={admin} />,
    fotos: <Photos admin={admin} />,
    numeros: <Numbers admin={admin} />
  }[route];

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy text-white lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Logo name={brand.name} segment={brand.segment} />
          <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-champagne">Painel da clínica</p>
        </div>
        <nav aria-label="Principal" className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = route === id;
            return (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-sm font-medium transition ${active ? 'bg-champagne text-navy' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                {label}
              </a>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noopener" className="flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> Ver o site
          </a>
          <button type="button" onClick={onLogout} className="flex min-h-11 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 text-white lg:hidden">
        <Logo name={brand.name} segment={brand.segment} className="scale-75 origin-left" />
        <div className="flex items-center">
          <a href="/" target="_blank" rel="noopener" aria-label="Ver o site" className="a-icon-btn text-white/80 hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
          <button type="button" onClick={onLogout} aria-label="Sair" className="a-icon-btn text-white/80 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">{page}</main>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-navy/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.filter((n) => BOTTOM.includes(n.id)).map(({ id, short, icon: Icon }) => {
          const active = route === id;
          return (
            <a key={id} href={`#/${id}`} aria-current={active ? 'page' : undefined} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium ${active ? 'text-navy' : 'text-navy/55'}`}>
              {active && <span className="absolute inset-x-5 top-0 h-1 rounded-b bg-champagne" aria-hidden="true" />}
              <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              {short}
            </a>
          );
        })}
        <button type="button" onClick={() => setMore(true)} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium ${BOTTOM.includes(route) ? 'text-navy/55' : 'text-navy'}`}>
          <Menu className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          Mais
        </button>
      </nav>

      <Dialog open={more} onClose={() => setMore(false)} label="Mais áreas">
        <DialogHeader title="Mais áreas" onClose={() => setMore(false)} />
        <ul className="divide-y divide-navy/10 overflow-y-auto bg-white">
          {NAV.filter((n) => !BOTTOM.includes(n.id)).map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a href={`#/${id}`} onClick={() => setMore(false)} className="flex min-h-14 items-center gap-4 px-5 font-medium">
                <Icon className="h-6 w-6 text-ocean" strokeWidth={1.5} aria-hidden="true" /> {label}
              </a>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
