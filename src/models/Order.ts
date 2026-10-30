import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  qty: number;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  customer: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: string;
  date: string;
  items: IOrderItem[];
}

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  customer: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, required: true },
  date: { type: String, required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      qty: Number,
      price: Number,
    },
  ],
});

orderSchema.index({ email: 1 });
orderSchema.index({ userId: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
