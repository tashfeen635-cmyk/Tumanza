export const SITE_NAME = 'Tumanza';
export const SITE_TAGLINE = "Nature's Finest Organic Nuts & Superfoods";
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

export const CONTACT_INFO = {
  address: '42 Orchard Lane, Portland, OR 97201',
  phone: '+1 (503) 555-0192',
  email: 'hello@tumanza.com',
  hours: 'Mon - Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM',
};
