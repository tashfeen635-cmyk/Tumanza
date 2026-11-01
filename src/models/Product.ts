import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  stock: string;
  image: string;
  section: string;
  badge: string;
  oldPrice: number;
  rating: number;
  description: string;
  urduName: string;
  sortOrder: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: String, required: true },
  image: { type: String, default: '' },
  section: { type: String, default: '' },
  badge: { type: String, default: '' },
  oldPrice: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  description: { type: String, default: '' },
  urduName: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
