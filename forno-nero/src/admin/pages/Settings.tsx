import { Database, Download, ExternalLink, RefreshCw, RotateCcw, Server, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { site } from '../../config/site';
import { ordersToCsv } from '../../shared/csv';
import { type Order } from '../../shared/orders';
import { clearAllOrders, isDemoOn, setDemoOn, syncDemoOrders } from '../../shared/ordersStore';
import { dayKey } from '../../shared/stats';
import { useCatalogAdmin } from '../hooks';
import { ConfirmDialog, Switch, useToast } from '../ui';

function download(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Settings({ orders }: { orders: Order[] }) {
  const toast = useToast();
  const catalog = useCatalogAdmin();
  const [demo, setDemo] = useState(isDemoOn);
  const [confirm, setConfirm] = useState<'orders' | 'catalog' | null>(null);

  const real = orders.filter((o) => o.source === 'site').length;
  const examples = orders.length - real;

  const toggleDemo = (on: boolean) => {
    setDemoOn(on);
    setDemo(on);
    syncDemoOrders(Date.now(), site.products, site.payments);
    toast.push(on ? 'Dados de exemplo ligados' : 'Dados de exemplo removidos. Só pedidos reais aparecem agora.');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-ink/65">Dados de exemplo, exportação e como este painel funcionaria de verdade.</p>
      </div>

      <section className="a-card divide-y divide-ink/10" aria-labelledby="cfg-demo">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <h2 id="cfg-demo" className="font-heading text-lg font-extrabold">Dados de exemplo</h2>
            <p className="mt-1 text-sm text-ink/65">
              Com isto ligado, o painel mostra 30 dias de vendas fictícias para você ver os gráficos funcionando. Pedidos feitos no site aparecem junto, sem se misturar na numeração (#1001 em diante).
            </p>
            <p className="mt-2 text-sm font-semibold">
              {orders.length} pedido(s): {real} do site · {examples} de exemplo
            </p>
          </div>
          <Switch checked={demo} onChange={toggleDemo} label="Dados de exemplo" />
        </div>
        <div className="flex flex-wrap gap-2 p-5">
          <button
            type="button"
            disabled={!demo}
            onClick={() => {
              syncDemoOrders(Date.now(), site.products, site.payments, true);
              toast.push(`Exemplos restaurados (${dayKey(Date.now()).split('-').reverse().join('/')})`);
            }}
            className="a-btn a-btn-ghost"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Restaurar exemplos
          </button>
          <button
            type="button"
            disabled={orders.length === 0}
            onClick={() => {
              download(`pedidos-forno-nero-${dayKey(Date.now())}.csv`, ordersToCsv(orders));
              toast.push('Planilha de pedidos baixada');
            }}
            className="a-btn a-btn-ghost"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Exportar pedidos (CSV)
          </button>
          <button type="button" disabled={orders.length === 0} onClick={() => setConfirm('orders')} className="a-btn text-danger hover:bg-danger/10">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Apagar todos os pedidos
          </button>
        </div>
      </section>

      <section className="a-card flex flex-wrap items-center justify-between gap-4 p-5" aria-labelledby="cfg-cat">
        <div>
          <h2 id="cfg-cat" className="font-heading text-lg font-extrabold">Cardápio</h2>
          <p className="mt-1 text-sm text-ink/65">{catalog.custom ? 'O cardápio do site foi editado neste painel.' : 'O site está usando o cardápio original.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/#cardapio" target="_blank" rel="noopener" className="a-btn a-btn-ghost">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver no site
          </a>
          <button type="button" disabled={!catalog.custom} onClick={() => setConfirm('catalog')} className="a-btn a-btn-ghost">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restaurar cardápio original
          </button>
        </div>
      </section>

      <section className="a-card p-5" aria-labelledby="cfg-demo-info">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/30 text-red">
            <Database className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 id="cfg-demo-info" className="font-heading text-lg font-extrabold">Como este painel funciona hoje</h2>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li>Tudo fica salvo <strong>neste navegador</strong>. Outro computador, celular ou aba anônima não vê os mesmos pedidos nem o mesmo cardápio.</li>
          <li>Um pedido feito no site <strong>neste mesmo navegador</strong> aparece aqui na hora. Pedidos de clientes reais, em outros aparelhos, <strong>não chegam</strong> ao painel sem um servidor.</li>
          <li>A senha de demonstração está no código da página: ela mostra a tela de login, mas <strong>não protege dados de verdade</strong>.</li>
        </ul>
      </section>

      <section className="a-card p-5" aria-labelledby="cfg-real">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/10 text-ink">
            <Server className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 id="cfg-real" className="font-heading text-lg font-extrabold">O que muda na versão de verdade</h2>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
          <li><strong>Banco de dados online</strong> para pedidos e cardápio, acessível de qualquer aparelho.</li>
          <li><strong>Login real</strong> com e-mail e senha (ou código por e-mail) e sessão no servidor.</li>
          <li><strong>Recebimento de pedidos</strong> do site no servidor, com aviso ao atendente (som, WhatsApp ou e-mail).</li>
          <li>Opcional: pagamento online (Pix, cartão), impressão de comanda e taxa de entrega por bairro.</li>
        </ul>
        <p className="mt-3 text-sm text-ink/60">As telas continuam as mesmas: só a camada de dados é trocada.</p>
      </section>

      <ConfirmDialog
        open={confirm === 'orders'}
        title="Apagar todos os pedidos?"
        text="Remove os pedidos do site e os de exemplo, e desliga os dados de exemplo. Isto não pode ser desfeito. Dica: exporte a planilha antes."
        confirmLabel="Apagar tudo"
        onConfirm={() => {
          clearAllOrders();
          setDemoOn(false);
          setDemo(false);
          toast.push('Pedidos apagados');
        }}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'catalog'}
        title="Restaurar o cardápio original?"
        text="Produtos criados, preços e fotos alterados neste painel serão descartados e o site volta ao cardápio padrão."
        confirmLabel="Restaurar"
        onConfirm={() => {
          catalog.restore();
          toast.push('Cardápio original restaurado');
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
