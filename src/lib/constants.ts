export const SITE_NAME = 'Tumanza';
export const SITE_TAGLINE = "Natural Wellness & Organic Products";
export const FREE_SHIPPING_THRESHOLD = 5933;
export const STANDARD_SHIPPING_FEE = 5;

export const PRODUCT_CATEGORIES = [
  'Nuts',
  'Herbs & Supplements',
  'Teas',
  'Mixes & Butters',
  'Spices',
] as const;

export const ORDER_STATUSES = ['Pending', 'Shipped', 'Delivered'] as const;

/**
 * NAP (Name / Address / Phone) — keep identical on footer, contact, schema & Google Business.
 */
export const CONTACT_INFO = {
  streetAddress: '166, Street 6, Block C, Media Town',
  address: '166, Street 6, Block C, Media Town, Islamabad, 44000',
  city: 'Islamabad',
  region: 'Islamabad Capital Territory',
  postalCode: '44000',
  country: 'PK',
  /** Local display format */
  phone: '0317-0885816',
  /** E.164 for schema / tel: / WhatsApp */
  phoneE164: '+923170885816',
  whatsappUrl: 'https://wa.me/923170885816',
  email: 'info@tumanza.com',
  hours: 'Mon - Fri: 9:00 AM - 6:00 PM PKT | Sat: 10:00 AM - 4:00 PM PKT',
};
