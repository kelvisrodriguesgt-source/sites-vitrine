import { About } from './components/About';
import { BookingForm } from './components/BookingForm';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InstagramGrid } from './components/InstagramGrid';
import { Reviews } from './components/Reviews';
import { Treatments } from './components/Treatments';

export function App() {
  return (
    <>
      <a href="#tratamentos" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cocoa focus:px-5 focus:py-3 focus:text-offwhite">
        Ir para os tratamentos
      </a>
      <Header />
      <main>
        <Hero />
        <Treatments />
        <About />
        <Experience />
        <Gallery />
        <Reviews />
        <InstagramGrid />
        <BookingForm />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
