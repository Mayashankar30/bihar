const configuredWhatsAppNumber = (
  import.meta.env.VITE_WHATSAPP_NUMBER || ''
).replace(/\D/g, '');

export const businessWhatsAppNumber = /^\d{8,15}$/.test(configuredWhatsAppNumber)
  ? configuredWhatsAppNumber
  : '917004719341';
