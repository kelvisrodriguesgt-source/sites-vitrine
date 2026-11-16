import { site } from '../config/site';
import { genericMessage } from '../lib/booking';
import { waLink } from '../lib/whatsapp';
import { WhatsAppIcon } from './icons';

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink(site.contact.whatsapp, genericMessage(site.brand.professional))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Jaqueline pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#1d6f46] text-white shadow-lift ring-2 ring-offwhite transition duration-300 hover:scale-105 hover:bg-[#165a38] active:scale-95 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
