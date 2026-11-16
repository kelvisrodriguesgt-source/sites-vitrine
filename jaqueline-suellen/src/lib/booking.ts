import { digitsOnly } from './whatsapp';

export interface BookingData {
  name: string;
  phone: string;
  procedure: string;
  day: string;
  message: string;
}

export type BookingErrors = Partial<Record<'name' | 'phone' | 'procedure' | 'day' | 'message', string>>;

export const emptyBooking: BookingData = { name: '', phone: '', procedure: '', day: '', message: '' };

export function validateBooking(data: BookingData, procedures: string[], days: string[], maxMessage: number): BookingErrors {
  const errors: BookingErrors = {};
  if (data.name.trim().length < 2) errors.name = 'Informe seu nome.';
  const phone = digitsOnly(data.phone);
  if (phone.length < 10 || phone.length > 11) errors.phone = 'Informe um telefone com DDD, como (69) 99999-9999.';
  else if (phone.length === 11 && phone[2] !== '9') errors.phone = 'Celular com 11 dígitos começa com 9 depois do DDD.';
  if (!procedures.includes(data.procedure)) errors.procedure = 'Escolha um tratamento.';
  if (!days.includes(data.day)) errors.day = 'Escolha o melhor dia.';
  if (data.message.length > maxMessage) errors.message = `A mensagem pode ter até ${maxMessage} caracteres.`;
  return errors;
}

/** Mensagem organizada para o WhatsApp. É só um pedido de contato: o horário é confirmado pela profissional. */
export function buildBookingMessage(data: BookingData, professional: string): string {
  const first = professional.split(' ')[0] ?? professional;
  const lines = [
    `Olá, ${first}! Vim pelo site e gostaria de agendar um horário.`,
    '',
    `*Nome:* ${data.name.trim()}`,
    `*Telefone:* ${data.phone.trim()}`,
    `*Tratamento:* ${data.procedure}`,
    `*Melhor dia:* ${data.day}`
  ];
  const note = data.message.trim();
  if (note) lines.push(`*Mensagem:* ${note}`);
  lines.push('', 'Aguardo seu retorno para combinar o melhor horário.');
  return lines.join('\n');
}

/** Mensagem curta do botão "Agendar" de cada cartão de tratamento. */
export const treatmentMessage = (professional: string, treatment: string): string => {
  const first = professional.split(' ')[0] ?? professional;
  return `Olá, ${first}! Vim pelo site e gostaria de agendar: ${treatment}.`;
};

export const genericMessage = (professional: string): string => {
  const first = professional.split(' ')[0] ?? professional;
  return `Olá, ${first}! Vim pelo site e gostaria de agendar um horário.`;
};
