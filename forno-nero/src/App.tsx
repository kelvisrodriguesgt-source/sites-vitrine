import { CartDrawer } from './components/CartDrawer';
import { Delivery } from './components/Delivery';
import { FloatingBag } from './components/FloatingBag';
import { Footer } from './components/Footer';
import { GameHost, GameSection } from './components/GameSection';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { Promos } from './components/Promos';
import { Reviews } from './components/Reviews';
import { Toast } from './components/Toast';
import { CartProvider } from './context/CartContext';
import { CatalogProvider } from './context/CatalogContext';
import { GameProvider } from './context/GameContext';

export function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <GameProvider>
          <a href="#conteudo" className="sr-only z-[60] rounded-full bg-ember px-4 py-2 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo">
            <Hero />
            <MenuSection />
            <Promos />
            <GameSection />
            <Reviews />
            <Delivery />
          </main>
          <Footer />
          <FloatingBag />
          <Toast />
          <CartDrawer />
          <GameHost />
        </GameProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
