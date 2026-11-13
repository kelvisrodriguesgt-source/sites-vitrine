import { Clinic } from './components/Clinic';
import { Contact } from './components/Contact';
import { Faq } from './components/Faq';
import { FinalCta } from './components/FinalCta';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Highlights } from './components/Highlights';
import { Steps } from './components/Steps';
import { Team } from './components/Team';
import { Technology } from './components/Technology';
import { Treatments } from './components/Treatments';
import { SiteProvider } from './context/SiteContext';

export function App() {
  return (
    <SiteProvider>
      <a
        href="#conteudo"
        className="sr-only z-[70] rounded-full bg-champagne px-5 py-3 text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-3">
        <Hero />
        <Treatments />
        <Clinic />
        <Highlights />
        <Technology />
        <Team />
        <Steps />
        <Faq />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </SiteProvider>
  );
}
