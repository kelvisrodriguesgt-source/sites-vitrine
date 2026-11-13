import { Eye, EyeOff, Lock } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { site } from '../../config/site';
import { Logo } from '../../components/Logo';
import { DEMO_PASSWORD } from '../config';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) onLogin();
    else setError('Senha incorreta. Tente de novo.');
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-wine px-5 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-tomato/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-mustard/30 blur-3xl" aria-hidden="true" />
      <div className="a-pop relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="a-card p-6 sm:p-7" noValidate>
          <h1 className="font-display text-3xl uppercase tracking-wide">Painel da loja</h1>
          <p className="mt-1 text-sm text-char/65">Pedidos, vendas e cardápio em um só lugar.</p>

          <label htmlFor="senha" className="a-label mt-6">
            Senha
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/40" aria-hidden="true" />
            <input
              id="senha"
              name="senha"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'senha-erro' : 'senha-dica'}
              className="a-input pl-10 pr-12"
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} className="a-icon-btn absolute right-0.5 top-0.5">
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {error ? (
            <p id="senha-erro" role="alert" className="mt-2 text-sm font-semibold text-tomato">
              {error}
            </p>
          ) : (
            <p id="senha-dica" className="mt-2 text-sm text-char/60">
              Senha de demonstração: <button type="button" onClick={() => setPassword(DEMO_PASSWORD)} className="rounded bg-mustard/30 px-1.5 font-mono font-bold text-char hover:bg-mustard/50">{DEMO_PASSWORD}</button>
            </p>
          )}

          <button type="submit" className="a-btn a-btn-primary mt-5 w-full">
            Entrar
          </button>
        </form>
        <p className="mt-5 text-center text-xs leading-relaxed text-cream/75">
          {site.brand.demo ? 'Painel de demonstração: funciona só neste navegador e não usa servidor.' : ''}
        </p>
      </div>
    </main>
  );
}
