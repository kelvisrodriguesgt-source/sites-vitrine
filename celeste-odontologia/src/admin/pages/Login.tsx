import { Eye, EyeOff, Lock } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Logo } from '../../components/ui';
import { defaultContent } from '../../config/site';
import { DEMO_PASSWORD } from '../config';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { brand } = defaultContent.info;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) onLogin();
    else setError('Senha incorreta. Tente de novo.');
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-ocean/70 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-champagne/20 blur-3xl" aria-hidden="true" />
      <div className="a-pop relative w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <Logo name={brand.name} segment={brand.segment} />
        </div>
        <form onSubmit={submit} className="rounded-[28px] bg-white p-6 text-navy shadow-pop sm:p-7" noValidate>
          <h1 className="font-serif text-3xl font-semibold">Painel da clínica</h1>
          <p className="mt-1 text-navy/65">Edite textos, fotos e tratamentos do seu site, sem complicação.</p>

          <label htmlFor="senha" className="a-label mt-6">
            Senha
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" aria-hidden="true" />
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
              className="a-input pl-11 pr-12"
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} className="a-icon-btn absolute right-1 top-1">
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {error ? (
            <p id="senha-erro" role="alert" className="a-err">
              {error}
            </p>
          ) : (
            <p id="senha-dica" className="a-hint">
              Senha de demonstração:{' '}
              <button type="button" onClick={() => setPassword(DEMO_PASSWORD)} className="rounded bg-champagne px-1.5 font-mono font-bold text-navy hover:bg-mist">
                {DEMO_PASSWORD}
              </button>
            </p>
          )}
          <button type="submit" className="a-btn a-btn-primary mt-5 w-full">
            Entrar
          </button>
        </form>
        <p className="mt-5 text-center text-xs leading-relaxed text-white/65">Painel de demonstração: funciona só neste navegador e não usa servidor.</p>
      </div>
    </main>
  );
}
