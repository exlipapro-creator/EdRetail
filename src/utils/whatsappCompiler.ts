import { CartItem, CustomerDetails, Lang } from '../types';

// Distributor contact details
export const TARGET_PHONE = '255783481416';
export const WHATSAPP_LINK = `https://wa.me/${TARGET_PHONE}`;
export const DISTRIBUTOR_NAME = 'Mwanahamisi Lissu';

/** Sanitise a phone string to digits-only international format */
export const sanitisePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  // Convert local TZ format (07xx / 06xx) to international (255xx)
  if (digits.startsWith('0') && digits.length === 10) {
    return '255' + digits.slice(1);
  }
  // Already international but missing leading 255
  if (!digits.startsWith('255') && digits.length === 9) {
    return '255' + digits;
  }
  return digits;
};

/** Escape special characters in user input to prevent message injection */
export const escapeMessageText = (text: string): string => {
  return text
    .trim()
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/\*/g, '\\*')   // Escape asterisks (WhatsApp formatting)
    .replace(/_/g, '\\_')    // Escape underscores (WhatsApp formatting)
    .replace(/~/g, '\\~')    // Escape tildes (WhatsApp formatting)
    .slice(0, 200);          // Enforce max length (200 chars)
};

/** Validate customer details — returns an error map */
export const validateCustomer = (
  name: string,
  phone: string,
  location: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!name.trim() || name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters)';
  }
  if (name.trim().length > 100) {
    errors.name = 'Name too long (max 100 characters)';
  }
  
  // Phone validation
  const sanitised = sanitisePhone(phone);
  if (!phone.trim() || sanitised.length < 10 || !/^\d+$/.test(sanitised)) {
    errors.phone = 'Please enter a valid phone number (e.g. 0712 345 678)';
  }
  
  // Location validation
  if (!location.trim() || location.trim().length < 3) {
    errors.location = 'Please enter your delivery location';
  }
  if (location.trim().length > 200) {
    errors.location = 'Location too long (max 200 characters)';
  }
  
  return errors;
};

/** Builds the raw order message text — used for both the on-screen preview and the wa.me link */
export const buildOrderMessage = (
  items: CartItem[],
  customer: CustomerDetails,
  lang: Lang = 'en'
): string => {
  const getName = (item: CartItem) =>
    typeof item.name === 'string' ? item.name : item.name[lang];

  const itemLines = items
    .map((item) => `  • ${item.quantity}x ${getName(item)} — ${formatPrice(item.price * item.quantity)} TZS`)
    .join('\n');

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const sanitisedPhone = sanitisePhone(customer.phone);

  return [
    '*🛒 NEW EDMARK ORDER*',
    '─────────────────────',
    '*Customer Details:*',
    `  • Name: ${escapeMessageText(customer.name)}`,
    `  • Phone: ${sanitisedPhone}`,
    `  • Location: ${escapeMessageText(customer.location)}`,
    '',
    '*Order Items:*',
    itemLines,
    '',
    `*Total Items:* ${totalItems}`,
    `*Total Price:* ${formatPrice(totalPrice)} TZS (~$${Math.round(totalPrice / 2650)} USD)`,
    '─────────────────────',
    'Please confirm availability and delivery timing. Thank you! 🙏',
  ].join('\n');
};

export const compileWhatsAppMessage = (
  items: CartItem[],
  customer: CustomerDetails,
  lang: Lang = 'en'
): string => {
  const message = buildOrderMessage(items, customer, lang);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${TARGET_PHONE}?text=${encodedMessage}`;
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-TZ').format(Math.round(price));

export const formatUsd = (usd: number): string => `~$${usd}`;
