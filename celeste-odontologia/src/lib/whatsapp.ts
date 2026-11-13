import type { Contact } from '../config/types';

/** Link único de WhatsApp: toda ação de agendamento usa este número. */
export function whatsappLink(contact: Pick<Contact, 'whatsapp'>, message: string): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const scheduleLink = (contact: Contact): string => whatsappLink(contact, contact.greeting);

export const treatmentMessage = (contact: Contact, treatment: string): string =>
  contact.treatmentGreeting.replace('{tratamento}', treatment.toLowerCase());

export const treatmentLink = (contact: Contact, treatment: string): string =>
  whatsappLink(contact, treatmentMessage(contact, treatment));

export const directionsLink = (address: { street: string; district: string; city: string; state: string; directionsUrl: string }): string =>
  address.directionsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address.street}, ${address.district}, ${address.city} - ${address.state}`
  )}`;
