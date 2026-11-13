import { site } from '../config/site';
import { scheduleLink } from '../lib/whatsapp';
import { WhatsAppIcon } from './ui';

export function FloatingWhatsApp() {
  return (
    <a
      href={scheduleLink(site.contact)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Agendar avaliação pelo WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-champagne text-navy shadow-glass transition duration-300 hover:scale-105 hover:bg-white sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
