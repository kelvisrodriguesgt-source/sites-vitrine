import { Copy, ImageOff, Package, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { site } from '../../config/site';
import type { Product } from '../../config/types';
import { formatBRL, toCents } from '../../lib/money';
import { isAvailable, slugId } from '../../shared/catalog';
import { useCatalogAdmin } from '../hooks';
import { ConfirmDialog, EmptyState, Switch, useToast } from '../ui';
import { ProductEditor } from './ProductEditor';
import { ProductThumb } from './ProductThumb';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Products() {
  const { products, save } = useCatalogAdmin();
  const toast = useToast();
  const latest = useRef(products);
  latest.current = products;

  const [category, setCategory] = useState<string>('todos');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const featuredCount = products.filter((p) => p.featured).length;
  const availableCount = products.filter(isAvailable).length;

  const shown = useMemo(() => {
    const q = norm(query.trim());
    return products.filter((p) => (category === 'todos' || p.category === category) && (!q || norm(p.name).includes(q) || norm(p.description).includes(q)));
  }, [products, category, query]);

  const commit = (next: Product[], message?: string, opts?: { actionLabel?: string; onAction?: () => void; ms?: number }): boolean => {
    if (!save(next)) {
      toast.push('Não foi possível salvar: o armazenamento do navegador está cheio. Remova fotos grandes ou produtos.', { tone: 'error', ms: 7000 });
      return false;
    }
    if (message) toast.push(message, opts);
    return true;
  };

  const toggleAvailable = (p: Product, on: boolean) => {
    const next = latest.current.map((x) => {
      if (x.id !== p.id) return x;
      if (on) {
        const { available: _a, ...rest } = x;
        return rest;
      }
      return { ...x, available: false };
    });
    commit(next, `${p.name}: ${on ? 'disponível' : 'indisponível'} no site`);
  };

  const toggleFeatured = (p: Product) => {
    if (!p.featured && featuredCount >= 3) {
      toast.push('Você já tem 3 destaques. Tire um para marcar outro.', { tone: 'error' });
      return;
    }
    const next = latest.current.map((x) => {
      if (x.id !== p.id) return x;
      if (x.featured) {
        const { featured: _f, ...rest } = x;
        return rest;
      }
      return { ...x, featured: true };
    });
    commit(next, p.featured ? `${p.name} saiu dos destaques` : `${p.name} agora é destaque`);
  };

  const duplicate = (p: Product) => {
    const ids = latest.current.map((x) => x.id);
    const copy: Product = { ...p, id: slugId(`${p.name} copia`, ids), name: `${p.name} (cópia)` };
    delete copy.featured;
    const idx = latest.current.findIndex((x) => x.id === p.id);
    const next = [...latest.current.slice(0, idx + 1), copy, ...latest.current.slice(idx + 1)];
    if (commit(next, 'Produto duplicado. Ajuste o nome e o preço.')) setEditing(copy);
  };

  const remove = (p: Product) => {
    const idx = latest.current.findIndex((x) => x.id === p.id);
    const next = latest.current.filter((x) => x.id !== p.id);
    commit(next, `${p.name} excluído`, {
      actionLabel: 'Desfazer',
      ms: 6000,
      onAction: () => {
        const cur = latest.current.filter((x) => x.id !== p.id);
        cur.splice(Math.min(idx, cur.length), 0, p);
        save(cur);
      }
    });
  };

  const onSave = (p: Product) => {
    const exists = latest.current.some((x) => x.id === p.id);
    const next = exists ? latest.current.map((x) => (x.id === p.id ? p : x)) : [...latest.current, p];
    if (commit(next, exists ? 'Alterações salvas' : `${p.name} adicionado ao cardápio`)) setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">Produtos</h1>
          <p className="mt-1 text-char/65">Adicione, edite ou remova itens do cardápio. O site atualiza na hora.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/#cardapio" target="_blank" rel="noopener" className="a-btn a-btn-ghost">
            Ver no site
          </a>
          <button type="button" onClick={() => setEditing('new')} className="a-btn a-btn-primary">
            <Plus className="h-5 w-5" aria-hidden="true" /> Novo produto
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {[
          ['Produtos', products.length],
          ['Disponíveis', availableCount],
          ['Destaques', `${featuredCount}/3`]
        ].map(([label, value]) => (
          <div key={label as string} className="a-card px-4 py-3">
            <dt className="a-label">{label}</dt>
            <dd className="mt-1 font-display text-3xl leading-none tracking-wide">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-char/40" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" aria-label="Buscar produto" className="a-input pl-10" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categorias">
          {[{ id: 'todos', label: 'Todos' }, ...site.categories].map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={`a-chip ${category === c.id ? 'a-chip-on' : 'a-chip-off'}`}>
              {c.label}
              <span className={`rounded-full px-2 text-xs ${category === c.id ? 'bg-white/20' : 'bg-char/10'}`}>
                {c.id === 'todos' ? products.length : products.filter((p) => p.category === c.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="a-card">
          <EmptyState
            icon={<Package className="h-6 w-6" aria-hidden="true" />}
            title={products.length === 0 ? 'Seu cardápio está vazio' : 'Nenhum produto encontrado'}
            text={products.length === 0 ? 'Adicione o primeiro produto para ele aparecer no site.' : 'Tente outra busca ou categoria.'}
            action={
              <button type="button" onClick={() => setEditing('new')} className="a-btn a-btn-primary">
                <Plus className="h-5 w-5" aria-hidden="true" /> Novo produto
              </button>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const on = isAvailable(p);
            const cat = site.categories.find((c) => c.id === p.category);
            return (
              <li key={p.id} className="a-card flex flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden bg-wine">
                  <ProductThumb product={p} />
                  {!on && (
                    <span className="absolute inset-0 flex items-center justify-center bg-char/45">
                      <span className="rounded bg-white px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-wider">Indisponível</span>
                    </span>
                  )}
                  {!p.image && (
                    <span className="absolute bottom-2 left-2.5 inline-flex items-center gap-1 rounded bg-black/30 px-2 py-0.5 text-[0.65rem] font-semibold text-white/85">
                      <ImageOff className="h-3 w-3" aria-hidden="true" /> sem foto
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p)}
                    aria-pressed={p.featured === true}
                    aria-label={p.featured ? `Tirar ${p.name} dos destaques` : `Destacar ${p.name} na página inicial`}
                    title={p.featured ? 'Destaque na página inicial' : 'Destacar na página inicial'}
                    className={`absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow transition active:scale-90 ${p.featured ? 'bg-mustard text-char' : 'bg-white/90 text-char/55 hover:text-char'}`}
                  >
                    <Star className="h-5 w-5" fill={p.featured ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-char/50">{cat?.label}</p>
                  <h2 className="mt-0.5 font-heading text-lg font-extrabold leading-tight">{p.name}</h2>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-char/65">{p.description || 'Sem descrição.'}</p>
                  <p className="mt-3 font-heading text-xl font-extrabold text-tomato">{formatBRL(toCents(p.price))}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-char/10 pt-3">
                    <label className="flex items-center gap-2.5 text-sm font-semibold">
                      <Switch checked={on} onChange={(v) => toggleAvailable(p, v)} label={`${p.name}: disponível`} />
                      {on ? 'Disponível' : 'Indisponível'}
                    </label>
                    <div className="flex">
                      <button type="button" onClick={() => setEditing(p)} className="a-icon-btn" aria-label={`Editar ${p.name}`} title="Editar">
                        <Pencil className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => duplicate(p)} className="a-icon-btn" aria-label={`Duplicar ${p.name}`} title="Duplicar">
                        <Copy className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setDeleting(p)} className="a-icon-btn hover:bg-tomato/10 hover:text-tomato" aria-label={`Excluir ${p.name}`} title="Excluir">
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <ProductEditor
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          existingIds={products.map((p) => p.id)}
          defaultCategory={category !== 'todos' ? category : (site.categories[0]?.id ?? '')}
          featuredCount={products.filter((p) => p.featured && (editing === 'new' || p.id !== editing.id)).length}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Excluir produto?"
        text={deleting ? <>“{deleting.name}” sai do cardápio do site. Você terá alguns segundos para desfazer.</> : null}
        confirmLabel="Excluir"
        onConfirm={() => deleting && remove(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
