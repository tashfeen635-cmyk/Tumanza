export interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: string;
  image: string;
  images?: string[];
  section: string;
  badge: string;
  oldPrice: number;
  rating: number;
  description: string;
  urduName: string;
  sortOrder?: number;
  reviewAvg?: number | null;
  reviewCount?: number;
  specifications?: string;
  benefits?: string;
  shippingInfo?: string;
  returnPolicy?: string;
}

export interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
}

export interface OrderRecord {
  _id: string;
  orderId: string;
  userId?: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | string;
  date: string;
  items: OrderItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  verified: boolean;
}

export interface ReviewRecord {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  productName?: string;
}

export interface SubscriberRecord {
  _id: string;
  email: string;
  date: string;
}

export interface RevenueData {
  labels: string[];
  values: number[];
}
