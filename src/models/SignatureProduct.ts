import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHighlight {
  title: string;
  subtitle: string;
}

export interface ISignatureProduct extends Document {
  enabled: boolean;
  published: boolean;
  sectionHeading: string;
  mainHeading: string;
  tagline: string;
  description: string;
  badge: string;
  price: number;
  oldPrice: number;
  stock: string;
  category: string;
  urduName: string;
  images: string[];
  highlights: IHighlight[];
  showRatings: boolean;
  orderButtonText: string;
  shippingText: string;
  paymentText: string;
  returnText: string;
  updatedAt: Date;
}

const highlightSchema = new Schema<IHighlight>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
});

const signatureProductSchema = new Schema<ISignatureProduct>({
  enabled: { type: Boolean, default: true },
  published: { type: Boolean, default: true },
  sectionHeading: { type: String, default: 'OUR SIGNATURE PRODUCT' },
  mainHeading: { type: String, default: 'Tumanza Shilajit' },
  tagline: { type: String, default: 'Pure Power from Gilgit-Baltistan' },
  description: { type: String, default: '' },
  badge: { type: String, default: 'PREMIUM QUALITY' },
  price: { type: Number, default: 59.00 },
  oldPrice: { type: Number, default: 79.00 },
  stock: { type: String, default: 'In Stock' },
  category: { type: String, default: 'Signature Product' },
  urduName: { type: String, default: 'خالص سلاجیت' },
  images: { type: [String], default: ['/images/shilajit.png'] },
  highlights: { type: [highlightSchema], default: [
    { title: '84+ Minerals', subtitle: 'Fulvic & Humic Acid' },
    { title: 'Stamina & Energy', subtitle: 'Natural Cellular Vitality' },
    { title: 'Gilgit Harvest', subtitle: 'Authentic High-Altitude' },
    { title: 'Lab Tested Purity', subtitle: '100% Certified Safe' },
  ] },
  showRatings: { type: Boolean, default: true },
  orderButtonText: { type: String, default: 'Order Now' },
  shippingText: { type: String, default: 'Free Nationwide Shipping' },
  paymentText: { type: String, default: 'Secure Payment COD Available' },
  returnText: { type: String, default: '100% Authentic Guaranteed' },
  updatedAt: { type: Date, default: Date.now },
});

export const SignatureProduct: Model<ISignatureProduct> =
  mongoose.models.SignatureProduct || mongoose.model<ISignatureProduct>('SignatureProduct', signatureProductSchema);
