import { CartItem, CustomerDetails, Lang } from '../types';

// Distributor contact details
export const TARGET_PHONE = '255683171345';
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

/** Validate customer details — returns an error map */
export const validateCustomer = (
  name: string,
  phone: string,
  location: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!name.trim() || name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters)';
  }
  const sanitised = sanitisePhone(phone);
  if (!phone.trim() || sanitised.length < 10 || !/^\d+$/.test(sanitised)) {
    errors.phone = 'Please enter a valid phone number (e.g. 0712 345 678)';
  }
  if (!location.trim() || location.trim().length < 3) {
    errors.location = 'Please enter your delivery location';
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
    `  • Name: ${customer.name.trim()}`,
    `  • Phone: ${sanitisedPhone}`,
    `  • Location: ${customer.location.trim()}`,
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
