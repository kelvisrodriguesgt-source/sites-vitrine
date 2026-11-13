import { CartDrawer } from './components/CartDrawer';
import { Combos } from './components/Combos';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { FinalCta } from './components/FinalCta';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Highlights } from './components/Highlights';
import { Instagram } from './components/Instagram';
import { MenuSection } from './components/MenuSection';
import { Story } from './components/Story';
import { Toast } from './components/Toast';
import { CartProvider } from './context/CartContext';

export function App() {
  return (
    <CartProvider>
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-mustard px-4 py-2 font-bold text-char focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Highlights />
        <MenuSection />
        <Experience />
        <Combos />
        <Story />
        <Instagram />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
      <FloatingActions />
      <Toast />
      <CartDrawer />
    </CartProvider>
  );
}
